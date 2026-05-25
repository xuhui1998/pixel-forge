<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <!-- Left: Controls -->
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Scissors :size="16" />
          <px-text>精灵图拆帧</px-text>
        </div>

        <px-card>
          <template #header>上传精灵图</template>
          <ImageUploader v-model="imageFile" accept="image/*" />
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>拆帧参数</template>
          <div v-if="originalSize" class="control-group">
            <label class="control-label"><px-text>原图尺寸: {{ originalSize.width }} × {{ originalSize.height }}</px-text></label>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>列数</px-text></label>
            <PxNumberInput v-model="cols" :min="1" />
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>行数</px-text></label>
            <PxNumberInput v-model="rows" :min="1" />
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="!imageFile || processing" @click="processSplit">
              {{ processing ? '拆帧中...' : '开始拆帧' }}
            </px-button>
          </div>
        </px-card>

        <!-- Download actions -->
        <px-card v-if="frames.length" class="mt-base">
          <template #header>下载</template>
          <div class="button-col">
            <px-button type="primary" @click="downloadAll"><Download :size="14" /> 下载全部</px-button>
            <px-button plain @click="downloadSelected" :disabled="selectedFrame < 0">下载选中</px-button>
          </div>
        </px-card>

        <!-- GIF Export -->
        <px-card v-if="frames.length" class="mt-base">
          <template #header>GIF 导出</template>
          <div class="control-group">
            <label class="control-label"><px-text>帧率 (FPS)</px-text></label>
            <div class="control-row">
              <PxSlider v-model="gifFps" :min="1" :max="30" :step="1" />
              <span class="control-value">{{ gifFps }}</span>
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>缩放倍数</px-text></label>
            <div class="control-row">
              <PxSlider v-model="gifScale" :min="1" :max="4" :step="1" />
              <span class="control-value">{{ gifScale }}x</span>
            </div>
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="gifProcessing" @click="exportGif">
              <Film :size="14" /> {{ gifProcessing ? `导出中 (${gifProgress}%)...` : '导出 GIF' }}
            </px-button>
          </div>
          <div v-if="gifProcessing" class="progress-bar mt-base">
            <div class="progress-fill" :style="{ width: gifProgress + '%' }"></div>
          </div>
          <div v-if="gifUrl" class="gif-preview mt-base">
            <img :src="gifUrl" class="gif-img" />
          </div>
          <div v-if="gifUrl" class="mt-base">
            <px-button type="primary" @click="downloadGif"><Download :size="14" /> 下载 GIF</px-button>
          </div>
        </px-card>
      </div>

      <!-- Right: Preview -->
      <div class="tool-page__main">
        <div v-if="!sourceUrl" class="tool-page__empty">
          <Scissors :size="48" :stroke-width="1" />
          <p>上传精灵图开始拆帧</p>
        </div>

        <div v-else class="preview-area">
          <!-- 网格线预览 -->
          <div class="preview-card">
            <div class="preview-card__header">
              <span>网格预览</span>
              <span v-if="originalSize" class="grid-info">{{ cols }} × {{ rows }} = {{ cols * rows }} 帧</span>
            </div>
            <div class="preview-card__canvas">
              <canvas
                ref="gridCanvas"
                class="grid-canvas"
                @mousemove="onGridHover"
                @mouseleave="hoveredFrame = -1"
              ></canvas>
              <div v-if="hoveredFrame >= 0" class="hover-info">
                帧 #{{ hoveredFrame }} ({{ Math.round(frameW) }}×{{ Math.round(frameH) }})
              </div>
            </div>
          </div>

          <!-- 拆帧结果 -->
          <div v-if="frames.length" class="preview-card" style="flex: 0 0 auto; max-height: 40%;">
            <div class="preview-card__header">拆帧结果 ({{ frames.length }} 帧)</div>
            <div class="frames-scroll">
              <div v-for="(frame, i) in frames" :key="i" class="frame-item" @click="selectedFrame = i">
                <img :src="frame.url" class="frame-img" :class="{ selected: selectedFrame === i }" />
                <span class="frame-index">#{{ i }}</span>
              </div>
            </div>
          </div>

          <!-- 动画预览 -->
          <div v-if="frames.length" class="preview-card" style="flex: 0 0 auto;">
            <div class="preview-card__header">
              <span>动画预览</span>
              <span class="anim-info">帧 {{ animCurrentIdx + 1 }} / {{ frames.length }}</span>
            </div>

            <div class="anim-body">
              <div class="anim-preview-wrapper">
                <canvas ref="animCanvas" class="anim-canvas"></canvas>
              </div>

              <!-- 帧进度条 -->
              <div class="anim-progress">
                <div class="anim-progress-bar">
                  <div
                    v-for="(frame, i) in frames"
                    :key="i"
                    class="anim-progress-segment"
                    :class="{
                      'is-active': i === animCurrentIdx,
                      'is-played': i <= animCurrentIdx
                    }"
                    @click="seekToFrame(i)"
                  ></div>
                </div>
              </div>

              <!-- 控制栏 -->
              <div class="anim-controls">
                <px-button size="small" plain @click="stopAnim" :disabled="!animPlaying && animCurrentIdx === 0">
                  <Square :size="14" />
                </px-button>
                <px-button size="small" type="primary" @click="togglePlay">
                  <component :is="animPlayIcon" :size="14" />
                </px-button>
                <px-button size="small" plain @click="stepPrev" :disabled="animPlaying">
                  <ChevronLeft :size="14" />
                </px-button>
                <px-button size="small" plain @click="stepNext" :disabled="animPlaying">
                  <ChevronRight :size="14" />
                </px-button>

                <div class="anim-fps-control">
                  <px-text class="anim-fps-label">FPS</px-text>
                  <PxSlider v-model="animFps" :min="1" :max="30" />
                  <px-text class="anim-fps-value">{{ animFps }}</px-text>
                </div>

                <div class="anim-mode-control">
                  <px-switch v-model="animLoop" size="small" active-text="循环" inactive-text="单次" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { Play, Pause, Square, ChevronLeft, ChevronRight, Download, Scissors, Film } from 'lucide-vue-next'
import GIF from 'gif.js'
import { loadImageToCanvas, getImageDimensions, downloadBlob } from '../../utils/canvas'
import { splitSpriteSheet } from '../../utils/sprite-utils'
import ImageUploader from '../common/ImageUploader.vue'

const imageFile = ref<File | null>(null)
const cols = ref(4)
const rows = ref(4)
const processing = ref(false)
const frames = ref<{ canvas: HTMLCanvasElement; url: string }[]>([])
const selectedFrame = ref(-1)
const hoveredFrame = ref(-1)
const originalSize = ref<{ width: number; height: number } | null>(null)
const sourceUrl = ref('')
const gridCanvas = ref<HTMLCanvasElement | null>(null)
const sourceImg = ref<HTMLImageElement | null>(null)

// ─── 动画预览状态 ───
const animCanvas = ref<HTMLCanvasElement | null>(null)
const animPlaying = ref(false)
const animCurrentIdx = ref(0)
const animFps = ref(12)
const animLoop = ref(true)    // true=循环  false=单次
let animTimer: ReturnType<typeof setInterval> | null = null

// Dynamic play/pause icon
const animPlayIcon = computed(() => animPlaying.value ? Pause : Play)

// 计算每帧宽高
const frameW = computed(() => originalSize.value ? originalSize.value.width / cols.value : 0)
const frameH = computed(() => originalSize.value ? originalSize.value.height / rows.value : 0)

let imageBlobUrl = ''

watch(imageFile, async (f) => {
  frames.value.forEach(fr => URL.revokeObjectURL(fr.url))
  frames.value = []
  selectedFrame.value = -1
  hoveredFrame.value = -1
  // 重置 GIF 导出状态
  if (gifUrl.value) { URL.revokeObjectURL(gifUrl.value); gifUrl.value = '' }
  gifBlob.value = null
  gifProcessing.value = false
  if (imageBlobUrl) { URL.revokeObjectURL(imageBlobUrl); imageBlobUrl = '' }
  if (!f) { originalSize.value = null; sourceUrl.value = ''; return }
  originalSize.value = await getImageDimensions(f)
  imageBlobUrl = URL.createObjectURL(f)
  sourceUrl.value = imageBlobUrl
  // 加载图片用于 canvas 绘制
  const img = new Image()
  img.onload = () => {
    sourceImg.value = img
    nextTick(() => drawGridPreview())
  }
  img.src = imageBlobUrl
})

// 参数变化时重绘网格线
watch([cols, rows], () => {
  nextTick(() => drawGridPreview())
})

/** 绘制网格线预览 */
function drawGridPreview() {
  const canvas = gridCanvas.value
  const img = sourceImg.value
  if (!canvas || !img || !originalSize.value) return

  const { width: iw, height: ih } = originalSize.value
  // 计算缩放：让预览宽度适配容器 (最大 ~480px)
  const maxW = 480
  const scale = Math.min(maxW / iw, 1)
  const displayW = Math.round(iw * scale)
  const displayH = Math.round(ih * scale)

  canvas.width = displayW
  canvas.height = displayH
  const ctx = canvas.getContext('2d')!

  // 绘制原图
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, 0, 0, displayW, displayH)

  // 绘制网格线
  const cellW = displayW / cols.value
  const cellH = displayH / rows.value

  ctx.strokeStyle = 'rgba(245, 78, 0, 0.8)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([6, 3])

  // 竖线
  for (let c = 1; c < cols.value; c++) {
    const x = Math.round(c * cellW) + 0.5
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, displayH); ctx.stroke()
  }
  // 横线
  for (let r = 1; r < rows.value; r++) {
    const y = Math.round(r * cellH) + 0.5
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(displayW, y); ctx.stroke()
  }

  // 帧序号标注
  ctx.setLineDash([])
  ctx.font = `${Math.max(9, Math.min(14, cellW / 3))}px "PS2P", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let r = 0; r < rows.value; r++) {
    for (let c = 0; c < cols.value; c++) {
      const idx = r * cols.value + c
      const cx = (c + 0.5) * cellW
      const cy = (r + 0.5) * cellH
      // 背景
      const label = `#${idx}`
      const tw = ctx.measureText(label).width + 8
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(cx - tw / 2, cy - 8, tw, 16)
      // 文字
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.fillText(label, cx, cy)
    }
  }
}

/** 鼠标悬停显示帧信息 */
function onGridHover(e: MouseEvent) {
  const canvas = gridCanvas.value
  if (!canvas || !originalSize.value) return
  const rect = canvas.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  const cellW = canvas.width / cols.value
  const cellH = canvas.height / rows.value
  const c = Math.floor(mx / cellW)
  const r = Math.floor(my / cellH)
  if (c >= 0 && c < cols.value && r >= 0 && r < rows.value) {
    hoveredFrame.value = r * cols.value + c
  } else {
    hoveredFrame.value = -1
  }
}

/** 执行拆帧 */
async function processSplit() {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const result = splitSpriteSheet(canvas, {
      columns: cols.value,
      rows: rows.value,
    })
    frames.value.forEach(f => URL.revokeObjectURL(f.url))
    frames.value = result.map(f => {
      const url = f.canvas.toDataURL()
      return { canvas: f.canvas, url }
    })
    selectedFrame.value = 0
  } catch (err) {
    console.error('拆帧失败:', err)
  } finally {
    processing.value = false
  }
}

async function downloadAll() {
  for (let i = 0; i < frames.value.length; i++) {
    const blob = await new Promise<Blob>((resolve) =>
      frames.value[i].canvas.toBlob((b) => resolve(b!), 'image/png'))
    downloadBlob(blob, `frame_${String(i).padStart(3, '0')}.png`)
  }
}

async function downloadSelected() {
  if (selectedFrame.value < 0) return
  const blob = await new Promise<Blob>((resolve) =>
    frames.value[selectedFrame.value].canvas.toBlob((b) => resolve(b!), 'image/png'))
  downloadBlob(blob, `frame_${String(selectedFrame.value).padStart(3, '0')}.png`)
}

/** ─── 动画预览控制 ─── */

/** 绘制当前帧到预览画布 */
function drawAnimFrame() {
  const canvas = animCanvas.value
  if (!canvas || !frames.value.length) return
  const src = frames.value[animCurrentIdx.value]
  if (!src) return

  const { width: fw, height: fh } = src.canvas
  // 缩放到合理预览尺寸 (最大 320px)
  const maxDim = 320
  const scale = Math.min(maxDim / fw, maxDim / fh, 1)
  const displayW = Math.round(fw * scale)
  const displayH = Math.round(fh * scale)

  canvas.width = displayW
  canvas.height = displayH
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, displayW, displayH)
  ctx.drawImage(src.canvas, 0, 0, displayW, displayH)
}

/** 开始播放 */
function startAnim() {
  stopAnim()
  if (!frames.value.length) return
  animPlaying.value = true
  const ms = Math.round(1000 / animFps.value)
  animTimer = setInterval(() => {
    const next = animCurrentIdx.value + 1
    if (next >= frames.value.length) {
      if (animLoop.value) {
        animCurrentIdx.value = 0
      } else {
        // 单次播放结束
        stopAnim()
        return
      }
    } else {
      animCurrentIdx.value = next
    }
    drawAnimFrame()
  }, ms)
}

/** 停止播放并重置到第 0 帧 */
function stopAnim() {
  animPlaying.value = false
  if (animTimer) { clearInterval(animTimer); animTimer = null }
  animCurrentIdx.value = 0
  drawAnimFrame()
}

/** 切换播放/暂停 */
function togglePlay() {
  if (animPlaying.value) {
    // 暂停
    animPlaying.value = false
    if (animTimer) { clearInterval(animTimer); animTimer = null }
  } else {
    // 如果在最后一帧，从头开始
    if (animCurrentIdx.value >= frames.value.length - 1) {
      animCurrentIdx.value = 0
    }
    startAnim()
  }
}

/** 单步前进 */
function stepNext() {
  if (animPlaying.value) return
  const next = animCurrentIdx.value + 1
  if (next < frames.value.length) {
    animCurrentIdx.value = next
    drawAnimFrame()
  }
}

/** 单步后退 */
function stepPrev() {
  if (animPlaying.value) return
  const prev = animCurrentIdx.value - 1
  if (prev >= 0) {
    animCurrentIdx.value = prev
    drawAnimFrame()
  }
}

/** 跳转到指定帧 */
function seekToFrame(idx: number) {
  animCurrentIdx.value = idx
  drawAnimFrame()
}

// FPS 变化时，若正在播放则重新启动定时器
watch(animFps, () => {
  if (animPlaying.value) startAnim()
})

// 拆帧完成后，初始化动画预览
watch(frames, () => {
  stopAnim()
  if (frames.value.length) {
    animCurrentIdx.value = 0
    nextTick(() => drawAnimFrame())
  }
})

// ─── GIF 导出状态 ───
const gifFps = ref(12)
const gifScale = ref(1)
const gifProcessing = ref(false)
const gifProgress = ref(0)
const gifBlob = ref<Blob | null>(null)
const gifUrl = ref('')

/** 导出 GIF */
function exportGif() {
  if (!frames.value.length) return
  gifProcessing.value = true
  gifProgress.value = 0

  const fw = frames.value[0].canvas.width * gifScale.value
  const fh = frames.value[0].canvas.height * gifScale.value

  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: fw,
    height: fh,
    transparent: 0x010101,
    workerScript: '/gif.worker.js',
  })

  frames.value.forEach((frame) => {
    const scaledCanvas = document.createElement('canvas')
    scaledCanvas.width = fw
    scaledCanvas.height = fh
    const ctx = scaledCanvas.getContext('2d')!
    ctx.clearRect(0, 0, fw, fh)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(frame.canvas, 0, 0, fw, fh)

    // Replace fully transparent pixels with transparent key color (#010101)
    const imageData = ctx.getImageData(0, 0, fw, fh)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) {
        data[i] = 1     // R
        data[i + 1] = 1 // G
        data[i + 2] = 1 // B
        data[i + 3] = 255 // A (fully opaque for gif.js to pick up)
      }
    }
    ctx.putImageData(imageData, 0, 0)

    gif.addFrame(scaledCanvas, {
      delay: Math.round(1000 / gifFps.value),
      copy: true,
    })
  })

  gif.on('progress', (p: number) => { gifProgress.value = Math.round(p * 100) })

  gif.on('finished', (blob: Blob) => {
    if (gifUrl.value) URL.revokeObjectURL(gifUrl.value)
    gifBlob.value = blob
    gifUrl.value = URL.createObjectURL(blob)
    gifProcessing.value = false
  })

  gif.render()
}

/** 下载 GIF */
function downloadGif() {
  if (!gifBlob.value) return
  downloadBlob(gifBlob.value, 'animation.gif')
}

onUnmounted(() => {
  if (imageBlobUrl) URL.revokeObjectURL(imageBlobUrl)
  frames.value.forEach(f => URL.revokeObjectURL(f.url))
  if (animTimer) clearInterval(animTimer)
})
</script>

<style scoped>
.tool-page__sidebar-title {
  display: flex; align-items: center; gap: var(--space-xs);
  font-size: var(--text-lg); font-weight: var(--weight-semibold); color: var(--color-ink);
  margin-bottom: var(--space-base);
}

.control-group { display: flex; flex-direction: column; gap: var(--space-xs); }
.control-label { font-size: 9px; color: var(--color-muted); text-transform: uppercase; }
.control-input {
  padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); width: 100%;
}
.control-row { display: flex; align-items: center; gap: var(--space-sm); }
.control-slider { flex: 1; accent-color: var(--color-primary); }
.control-value { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); min-width: 32px; text-align: right; }
.button-col { display: flex; flex-direction: column; gap: var(--space-sm); }

/* Preview Area */
.preview-area {
  display: flex; flex-direction: column; gap: var(--space-base);
  height: 100%;
}
.preview-card {
  display: flex; flex-direction: column;
  flex: 1; min-height: 0;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.preview-card__header {
  display: flex; align-items: center; gap: 6px;
  padding: var(--space-sm) var(--space-base);
  border-bottom: 1px solid var(--color-hairline);
  font-size: var(--text-sm); color: var(--color-body);
}
.preview-card__canvas {
  flex: 1; min-height: 0;
  display: flex; justify-content: center; align-items: center;
  overflow: auto; position: relative;
  padding: var(--space-base);
  background: var(--color-surface-card);
}

/* Grid info */
.grid-info { font-size: 8px; color: var(--color-primary); }
.grid-canvas { image-rendering: pixelated; max-width: 100%; cursor: crosshair; }
.hover-info {
  position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.75); color: #fff; font-family: var(--font-pixel, "PS2P", monospace);
  font-size: 8px; padding: 4px 10px; border-radius: 4px; pointer-events: none; white-space: nowrap;
}

/* Frames */
.frames-scroll {
  display: flex; gap: var(--space-sm); padding: var(--space-base);
  overflow-x: auto;
}
.frame-item { display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; flex-shrink: 0; }
.frame-img {
  width: 48px; height: 48px; object-fit: contain; border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md); background: var(--color-surface-card);
  image-rendering: pixelated; transition: all 0.15s ease;
}
.frame-img.selected { border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(245, 78, 0, 0.2); }
.frame-index { font-family: var(--font-pixel, "PS2P", monospace); font-size: 8px; color: var(--color-muted); }

/* Animation */
.anim-info { font-size: 8px; color: var(--color-primary); }
.anim-body { padding: var(--space-base); display: flex; flex-direction: column; gap: var(--space-sm); }
.anim-preview-wrapper {
  display: flex; justify-content: center; align-items: center;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  padding: var(--space-base);
  min-height: 120px;
  background-image:
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
}
.anim-canvas { image-rendering: pixelated; max-width: 100%; }

/* Frame progress */
.anim-progress { display: flex; justify-content: center; }
.anim-progress-bar {
  display: flex; gap: 2px; width: 100%; height: 12px;
  border-radius: 3px; overflow: hidden;
  border: 1px solid var(--color-hairline);
  background: var(--color-canvas-soft);
}
.anim-progress-segment {
  flex: 1; cursor: pointer; transition: background 0.1s;
  background: var(--color-hairline-soft, #efeee8);
  border-right: 1px solid var(--color-hairline);
}
.anim-progress-segment:last-child { border-right: none; }
.anim-progress-segment.is-played { background: rgba(245, 78, 0, 0.25); }
.anim-progress-segment.is-active { background: var(--color-primary); }
.anim-progress-segment:hover { opacity: 0.8; }

/* Controls */
.anim-controls { display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; }
.anim-fps-control { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.anim-fps-label { font-size: 9px; color: var(--color-muted); text-transform: uppercase; }
.anim-fps-value { font-size: 9px; color: var(--color-primary); min-width: 20px; text-align: center; }
.anim-fps-slider { width: 80px; height: 4px; cursor: pointer; accent-color: var(--color-primary); }
.anim-mode-control { display: flex; align-items: center; }

/* GIF Export */
.gif-export-actions { display: flex; align-items: center; }
.progress-bar { height: 8px; background: var(--color-hairline); border-radius: var(--radius-md); overflow: hidden; }
.progress-fill { height: 100%; background: var(--color-primary); transition: width 0.2s ease; }
.gif-preview { display: flex; justify-content: center; background: var(--color-surface-card); border-radius: var(--radius-md); border: 1px solid var(--color-hairline); padding: var(--space-base); }
.gif-img { max-width: 100%; max-height: 200px; image-rendering: auto; }
</style>
