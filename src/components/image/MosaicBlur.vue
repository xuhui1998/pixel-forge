<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Square :size="16" />
          <px-text>马赛克打码</px-text>
        </div>

        <px-card>
          <template #header>上传图片</template>
          <ImageUploader v-model="imageFile" />
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>马赛克设置</template>
          <div class="control-group">
            <label class="control-label"><px-text>方块大小</px-text></label>
            <div class="control-row">
              <PxSlider v-model="blockSize" :min="2" :max="80" :step="1" />
              <span class="control-value">{{ blockSize }}px</span>
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>应用范围</px-text></label>
            <PxSegmented v-model="mode" :options="[{ value: 'full', label: '全图' }, { value: 'region', label: '区域' }]" />
            <p v-if="mode === 'region'" class="control-hint">💡 在左侧图片上拖拽鼠标框选区域</p>
          </div>
          <template v-if="mode === 'region'">
            <div class="control-group mt-base">
              <label class="control-label"><px-text>X 起点</px-text></label>
              <div class="control-row">
                <PxSlider v-model="region.x" :min="0" :max="imgSize.w" :step="1" />
                <span class="control-value">{{ region.x }}</span>
              </div>
            </div>
            <div class="control-group mt-base">
              <label class="control-label"><px-text>Y 起点</px-text></label>
              <div class="control-row">
                <PxSlider v-model="region.y" :min="0" :max="imgSize.h" :step="1" />
                <span class="control-value">{{ region.y }}</span>
              </div>
            </div>
            <div class="control-group mt-base">
              <label class="control-label"><px-text>宽度</px-text></label>
              <div class="control-row">
                <PxSlider v-model="region.width" :min="1" :max="imgSize.w" :step="1" />
                <span class="control-value">{{ region.width }}</span>
              </div>
            </div>
            <div class="control-group mt-base">
              <label class="control-label"><px-text>高度</px-text></label>
              <div class="control-row">
                <PxSlider v-model="region.height" :min="1" :max="imgSize.h" :step="1" />
                <span class="control-value">{{ region.height }}</span>
              </div>
            </div>
          </template>
          <div class="mt-base">
            <px-button type="primary" :disabled="processing" @click="processImage">
              {{ processing ? '处理中...' : '应用马赛克' }}
            </px-button>
          </div>
        </px-card>

        <px-card v-if="resultUrl" class="mt-base">
          <template #header>导出</template>
          <div class="control-group">
            <label class="control-label"><px-text>格式</px-text></label>
            <PxSegmented v-model="format" :options="[{ value: 'png', label: 'PNG' }, { value: 'webp', label: 'WebP' }, { value: 'jpeg', label: 'JPEG' }]" />
          </div>
          <div class="mt-base">
            <px-button type="primary" @click="downloadResult">下载图片</px-button>
          </div>
        </px-card>
      </div>

      <div class="tool-page__main">
        <div v-if="!imageFile" class="tool-page__empty">
          <Square :size="48" :stroke-width="1" />
          <p>上传图片后在此预览</p>
        </div>
        <div v-else class="compare">
          <!-- Original image with drag selection overlay -->
          <div class="select-canvas-wrap">
            <div class="select-canvas__header">
              <px-text class="select-canvas__label">原图</px-text>
              <span v-if="imgEl" class="select-canvas__dims">{{ imgEl.naturalWidth }} × {{ imgEl.naturalHeight }}</span>
            </div>
            <div
              ref="canvasWrapperRef"
              class="select-canvas__body"
              :class="{ 'select-canvas--crosshair': mode === 'region' }"
            >
              <canvas ref="imgCanvasRef" class="select-canvas__img" />
              <canvas
                ref="overlayCanvasRef"
                class="select-canvas__overlay"
                @mousedown="onMouseDown"
                @mousemove="onMouseMove"
                @mouseup="onMouseUp"
                @mouseleave="onMouseUp"
              />
            </div>
          </div>
          <!-- Result preview -->
          <CanvasPreview v-if="resultUrl" :src="resultUrl" label="马赛克" :fill="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Square } from 'lucide-vue-next'
import { loadImageToCanvas, canvasToBlob, downloadBlob, generateFilename } from '../../utils/canvas'
import { applyMosaic } from '../../utils/mosaic'
import ImageUploader from '../common/ImageUploader.vue'
import CanvasPreview from '../common/CanvasPreview.vue'

const imageFile = ref<File | null>(null)
const originalUrl = ref('')
const resultUrl = ref('')
const processing = ref(false)
const blockSize = ref(10)
const mode = ref<'full' | 'region'>('full')
const format = ref('png')
const imgSize = reactive({ w: 800, h: 600 })
const region = reactive({ x: 0, y: 0, width: 100, height: 100 })

// Canvas refs for selection overlay
const canvasWrapperRef = ref<HTMLDivElement | null>(null)
const imgCanvasRef = ref<HTMLCanvasElement | null>(null)
const overlayCanvasRef = ref<HTMLCanvasElement | null>(null)
const imgEl = ref<HTMLImageElement | null>(null)

// Drag state
let isDragging = false
let dragStartScreen = { x: 0, y: 0 }
let dragEndScreen = { x: 0, y: 0 }

// Computed transform: image -> canvas coordinate mapping
// After drawImageToCanvas, these are set
let imgOffsetX = 0
let imgOffsetY = 0
let imgScale = 1
let resizeObserver: ResizeObserver | null = null

// ---- Mode ----
function setMode(m: 'full' | 'region') {
  mode.value = m
  nextTick(() => drawOverlay())
}

// ---- Image loading ----
watch(imageFile, (f) => {
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  originalUrl.value = ''; resultUrl.value = ''
  if (f) {
    originalUrl.value = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => {
      imgEl.value = img
      imgSize.w = img.naturalWidth; imgSize.h = img.naturalHeight
      region.x = Math.floor(img.naturalWidth * 0.25)
      region.y = Math.floor(img.naturalHeight * 0.25)
      region.width = Math.floor(img.naturalWidth * 0.5)
      region.height = Math.floor(img.naturalHeight * 0.5)
      nextTick(() => {
        setupResizeObserver()
        drawImageToCanvas()
      })
    }
    img.src = originalUrl.value
  } else {
    imgEl.value = null
  }
})

// ---- Canvas rendering ----
function drawImageToCanvas() {
  if (!imgCanvasRef.value || !canvasWrapperRef.value || !imgEl.value) return
  const wrapper = canvasWrapperRef.value
  const wrapW = wrapper.clientWidth
  const wrapH = wrapper.clientHeight
  if (wrapW === 0 || wrapH === 0) return

  const imgW = imgEl.value.naturalWidth
  const imgH = imgEl.value.naturalHeight
  const scale = Math.min(wrapW / imgW, wrapH / imgH, 1)
  const drawW = Math.round(imgW * scale)
  const drawH = Math.round(imgH * scale)
  const offX = Math.round((wrapW - drawW) / 2)
  const offY = Math.round((wrapH - drawH) / 2)

  imgOffsetX = offX; imgOffsetY = offY; imgScale = scale

  // Set both canvases to wrapper size
  imgCanvasRef.value.width = wrapW
  imgCanvasRef.value.height = wrapH
  if (overlayCanvasRef.value) {
    overlayCanvasRef.value.width = wrapW
    overlayCanvasRef.value.height = wrapH
  }

  // Draw image
  const ctx = imgCanvasRef.value.getContext('2d')!
  ctx.clearRect(0, 0, wrapW, wrapH)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(imgEl.value, offX, offY, drawW, drawH)

  drawOverlay()
}

function drawOverlay() {
  if (!overlayCanvasRef.value) return
  const canvas = overlayCanvasRef.value
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (mode.value !== 'region') return

  // Draw dimming overlay outside selection
  const sx = Math.round(region.x * imgScale + imgOffsetX)
  const sy = Math.round(region.y * imgScale + imgOffsetY)
  const sw = Math.round(region.width * imgScale)
  const sh = Math.round(region.height * imgScale)

  // Semi-transparent mask
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // Clear the selected area
  ctx.clearRect(sx, sy, sw, sh)

  // Selection border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 3])
  ctx.strokeRect(sx, sy, sw, sh)
  ctx.setLineDash([])

  // Corner handles
  const hs = 5
  ctx.fillStyle = '#fff'
  const corners = [
    [sx, sy], [sx + sw, sy],
    [sx, sy + sh], [sx + sw, sy + sh],
  ]
  for (const [cx, cy] of corners) {
    ctx.fillRect(cx - hs, cy - hs, hs * 2, hs * 2)
  }

  // Region size label
  const label = `${region.width}×${region.height}`
  ctx.font = '11px monospace'
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  const tm = ctx.measureText(label)
  const lx = sx + sw / 2 - tm.width / 2
  const ly = sy + sh + 16
  ctx.fillRect(lx - 3, ly - 10, tm.width + 6, 14)
  ctx.fillStyle = '#fff'
  ctx.fillText(label, lx, ly)
}

// Watch region sliders -> redraw overlay
watch([() => region.x, () => region.y, () => region.width, () => region.height, mode], () => {
  drawOverlay()
})

// ---- Mouse drag ----
function screenToImage(sx: number, sy: number) {
  return {
    x: Math.round((sx - imgOffsetX) / imgScale),
    y: Math.round((sy - imgOffsetY) / imgScale),
  }
}

function getCanvasPos(e: MouseEvent) {
  if (!overlayCanvasRef.value) return { x: 0, y: 0 }
  const rect = overlayCanvasRef.value.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function clampRegion() {
  region.x = Math.max(0, Math.min(region.x, imgSize.w - 1))
  region.y = Math.max(0, Math.min(region.y, imgSize.h - 1))
  region.width = Math.max(1, Math.min(region.width, imgSize.w - region.x))
  region.height = Math.max(1, Math.min(region.height, imgSize.h - region.y))
}

function onMouseDown(e: MouseEvent) {
  if (mode.value !== 'region') return
  e.preventDefault()
  isDragging = true
  const pos = getCanvasPos(e)
  dragStartScreen = { ...pos }
  dragEndScreen = { ...pos }
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging) return
  e.preventDefault()
  const pos = getCanvasPos(e)
  dragEndScreen = { ...pos }

  // Update region from drag
  const imgStart = screenToImage(
    Math.min(dragStartScreen.x, dragEndScreen.x),
    Math.min(dragStartScreen.y, dragEndScreen.y)
  )
  const imgEnd = screenToImage(
    Math.max(dragStartScreen.x, dragEndScreen.x),
    Math.max(dragStartScreen.y, dragEndScreen.y)
  )

  region.x = Math.max(0, imgStart.x)
  region.y = Math.max(0, imgStart.y)
  region.width = Math.min(imgEnd.x - region.x, imgSize.w - region.x)
  region.height = Math.min(imgEnd.y - region.y, imgSize.h - region.y)
  clampRegion()
  drawOverlay()
}

function onMouseUp(e: MouseEvent) {
  if (!isDragging) return
  isDragging = false
  if (dragStartScreen.x === dragEndScreen.x && dragStartScreen.y === dragEndScreen.y) {
    // Single click, no drag — ignore
    return
  }
  clampRegion()
  drawOverlay()
}

// ---- ResizeObserver ----
function setupResizeObserver() {
  if (resizeObserver) resizeObserver.disconnect()
  if (canvasWrapperRef.value) {
    resizeObserver = new ResizeObserver(() => {
      drawImageToCanvas()
    })
    resizeObserver.observe(canvasWrapperRef.value)
  }
}

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
})

// ---- Process & Export ----
async function processImage() {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const opts = mode.value === 'full'
      ? { blockSize: blockSize.value }
      : { blockSize: blockSize.value, region: { ...region } }
    const result = applyMosaic(canvas, opts)
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    const blob = await canvasToBlob(result, 'image/png')
    resultUrl.value = URL.createObjectURL(blob)
  } catch (e) { console.error(e) } finally { processing.value = false }
}

async function downloadResult() {
  if (!resultUrl.value || !imageFile.value) return
  const resp = await fetch(resultUrl.value)
  const blob = await resp.blob()
  downloadBlob(blob, generateFilename(imageFile.value.name, 'mosaic', format.value))
}
</script>

<style scoped>
.tool-page__sidebar-title {
  display: flex; align-items: center; gap: var(--space-xs);
  font-size: var(--text-lg); font-weight: var(--weight-semibold); color: var(--color-ink);
  margin-bottom: var(--space-base);
}
.control-group { display: flex; flex-direction: column; gap: var(--space-xs); }
.control-label { font-size: 9px; color: var(--color-muted); text-transform: uppercase; }
.control-row { display: flex; align-items: center; gap: var(--space-sm); }
.control-slider { flex: 1; accent-color: var(--color-primary); }
.control-value { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); min-width: 48px; text-align: right; }
.control-hint { font-size: var(--text-sm); color: var(--color-primary); margin-top: 4px; }

.format-btns { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.format-btn {
  padding: 4px 12px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm);
  background: transparent; color: var(--color-body); font-size: var(--text-sm); cursor: pointer;
}
.format-btn:hover { border-color: var(--color-primary); }
.format-btn.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

.mode-btns { display: flex; gap: var(--space-xs); }

.compare { display: flex; gap: var(--space-base); height: 100%; width: 100%; align-items: center; justify-content: center; }

/* ---- Selection Canvas ---- */
.select-canvas-wrap {
  display: flex; flex-direction: column; flex: 1; min-height: 0;
  background: var(--color-surface-card); border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg); overflow: hidden;
}
.select-canvas__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-sm) var(--space-base); border-bottom: 1px solid var(--color-hairline-soft);
  flex-shrink: 0;
}
.select-canvas__label {
  font-size: 9px; color: var(--color-muted); text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}
.select-canvas__dims {
  font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-muted);
}
.select-canvas__body {
  position: relative; flex: 1; min-height: 0;
  background: repeating-conic-gradient(var(--color-canvas-soft) 0% 25%, var(--color-canvas) 0% 50%) 0 0 / 16px 16px;
  overflow: hidden;
}
.select-canvas--crosshair { cursor: crosshair; }

.select-canvas__img {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
}
.select-canvas__overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
}
</style>
