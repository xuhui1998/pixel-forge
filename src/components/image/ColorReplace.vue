<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <!-- Left: Controls -->
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Palette :size="16" />
          <px-text>颜色替换</px-text>
        </div>

        <px-card>
          <template #header>上传图片</template>
          <ImageUploader v-model="imageFile" />
        </px-card>
        <px-card v-if="imageFile" class="mt-base">
          <template #header>颜色设置</template>
          <div class="control-group">
            <label class="control-label"><px-text>源颜色 (在预览图点击拾取)</px-text></label>
            <div class="color-row">
              <PxColorPicker v-model="sourceColorHex" show-hex />
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>目标颜色</px-text></label>
            <div class="color-row">
              <PxColorPicker v-model="targetColorHex" show-hex />
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>容差 (0 - 100)</px-text></label>
            <div class="control-row">
              <PxSlider v-model="tolerance" :min="0" :max="100" :step="1" />
              <span class="control-value">{{ tolerance }}</span>
            </div>
          </div>
          <div class="mt-base">
            <PxSwitch v-model="preserveShading" label="保持明暗渐变" />
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="!imageFile || processing" @click="processReplace">
              {{ processing ? '处理中...' : '替换颜色' }}
            </px-button>
          </div>
        </px-card>

        <!-- Export (moved into sidebar) -->
        <px-card v-if="imageFile" class="mt-base">
          <template #header>导出设置</template>
          <div class="control-group">
            <label class="control-label"><px-text>输出格式</px-text></label>
            <PxSegmented v-model="exportFormat" :options="formats" />
          </div>
          <div v-if="exportFormat !== 'image/png'" class="control-group mt-base">
            <label class="control-label"><px-text>质量</px-text></label>
            <div class="control-row">
              <PxSlider v-model="exportQuality" :min="0.1" :max="1" :step="0.05" />
              <span class="control-value">{{ Math.round(exportQuality * 100) }}%</span>
            </div>
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="!resultBlob" @click="downloadResult">
              <Download :size="14" /> 下载
            </px-button>
          </div>
        </px-card>
      </div>

      <!-- Right: Preview -->
      <div class="tool-page__main">
        <div v-if="!imageFile" class="tool-page__empty">
          <Palette :size="48" :stroke-width="1" />
          <p>上传图片开始颜色替换</p>
        </div>

        <div v-else class="preview-area">
          <!-- Main preview -->
          <div class="preview-card">
            <div class="preview-card__header">
              <span>预览 (点击拾取颜色 · 滚轮缩放)</span>
              <span v-if="zoomLevel !== 1" class="zoom-badge">{{ Math.round(zoomLevel * 100) }}%</span>
              <button v-if="zoomLevel !== 1" class="zoom-reset" @click="zoomLevel = 1">重置</button>
            </div>
            <div
              class="preview-card__canvas"
              ref="canvasWrapperRef"
              @click="pickColor"
              @wheel.prevent="onWheel"
            >
              <canvas ref="sourceCanvasRef" class="hidden-canvas" />
              <img
                v-if="!resultUrl"
                :src="originalUrl"
                ref="previewImg"
                class="preview-img"
                :style="{ transform: `scale(${zoomLevel})`, transformOrigin: zoomOrigin }"
                @load="onImageLoad"
                draggable="false"
              />
              <img
                v-else
                :src="resultUrl"
                class="preview-img"
                :style="{ transform: `scale(${zoomLevel})`, transformOrigin: zoomOrigin }"
                draggable="false"
              />
            </div>
          </div>

          <!-- Result preview -->
          <div v-if="resultUrl" class="preview-card">
            <div class="preview-card__header">
              <span>替换结果</span>
              <span class="hint">点击可再次拾取颜色</span>
            </div>
            <div class="preview-card__canvas" @click="pickColorFromResult" @wheel.prevent="onWheelResult">
              <img :src="resultUrl" ref="resultImgRef" class="preview-img"
                :style="{ transform: `scale(${zoomLevel})`, transformOrigin: zoomOrigin }" draggable="false" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Palette, Download } from 'lucide-vue-next'
import { loadImageToCanvas, downloadBlob, generateFilename } from '../../utils/canvas'
import { replaceColor } from '../../utils/color-replace'
import ImageUploader from '../common/ImageUploader.vue'

/* ── State ── */
const imageFile = ref<File | null>(null)
const originalUrl = ref('')
const sourceColorHex = ref('#ff0000')
const targetColorHex = ref('#00ff00')
const tolerance = ref(30)
const preserveShading = ref(true)
const exportFormat = ref<'image/png' | 'image/jpeg' | 'image/webp'>('image/png')
const exportQuality = ref(0.92)

const processing = ref(false)
const resultBlob = ref<Blob | null>(null)
const resultUrl = ref('')

/* ── Refs ── */
const previewImg = ref<HTMLImageElement | null>(null)
const resultImgRef = ref<HTMLImageElement | null>(null)
const sourceCanvasRef = ref<HTMLCanvasElement | null>(null)
const canvasWrapperRef = ref<HTMLDivElement | null>(null)

/* ── Zoom ── */
const zoomLevel = ref(1)
const zoomOrigin = ref('center center')
const MIN_ZOOM = 0.25
const MAX_ZOOM = 8

const formats = [
  { value: 'image/png' as const, label: 'PNG' },
  { value: 'image/jpeg' as const, label: 'JPEG' },
  { value: 'image/webp' as const, label: 'WebP' },
]

/* ── Watchers ── */
watch(imageFile, (f) => {
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  resultUrl.value = ''
  resultBlob.value = null
  zoomLevel.value = 1

  if (f) {
    originalUrl.value = URL.createObjectURL(f)
    // Load source canvas for color picking
    nextTick(() => loadSourceCanvas(f!))
  } else {
    originalUrl.value = ''
  }
})

/* ── Source Canvas (for reliable color picking) ── */
function loadSourceCanvas(file: File) {
  const img = new Image()
  img.onload = () => {
    const c = sourceCanvasRef.value
    if (!c) return
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
  }
  img.src = URL.createObjectURL(file)
}

function onImageLoad() {
  // Ensure source canvas is loaded too
  if (imageFile.value && sourceCanvasRef.value?.width === 0) {
    loadSourceCanvas(imageFile.value)
  }
}

/* ── Zoom ── */
function onWheel(e: WheelEvent) {
  applyZoom(e)
}
function onWheelResult(e: WheelEvent) {
  applyZoom(e)
}
function applyZoom(e: WheelEvent) {
  const delta = e.deltaY > 0 ? -0.15 : 0.15
  zoomLevel.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel.value + delta * zoomLevel.value))
}

/* ── Pick Color ── */
function pickColor(e: MouseEvent) {
  const img = previewImg.value
  const c = sourceCanvasRef.value
  if (!img || !c || c.width === 0) return

  const ctx = c.getContext('2d')!
  const rect = img.getBoundingClientRect()

  // Map click position to natural image coords (accounting for CSS transform + zoom)
  const clickX = e.clientX - rect.left
  const clickY = e.clientY - rect.top
  const displayW = rect.width
  const displayH = rect.height

  const nx = Math.floor((clickX / displayW) * c.width)
  const ny = Math.floor((clickY / displayH) * c.height)

  if (nx < 0 || nx >= c.width || ny < 0 || ny >= c.height) return

  const [r, g, b] = ctx.getImageData(nx, ny, 1, 1).data
  sourceColorHex.value = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function pickColorFromResult(e: MouseEvent) {
  const img = resultImgRef.value
  if (!img) return

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  const rect = img.getBoundingClientRect()
  const nx = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width)
  const ny = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height)

  if (nx < 0 || nx >= canvas.width || ny < 0 || ny >= canvas.height) return

  const [r, g, b] = ctx.getImageData(nx, ny, 1, 1).data
  sourceColorHex.value = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

/* ── Hex ↔ RGB ── */
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

/* ── Process ── */
async function processReplace() {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const srcColor = hexToRgb(sourceColorHex.value)
    const tgtColor = hexToRgb(targetColorHex.value)
    const result = replaceColor(canvas, {
      sourceColor: srcColor,
      targetColor: tgtColor,
      tolerance: tolerance.value,
      preserveShading: preserveShading.value,
    })
    const blob = await new Promise<Blob>((resolve) =>
      result.toBlob((b) => resolve(b!), 'image/png')
    )
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultBlob.value = blob
    resultUrl.value = URL.createObjectURL(blob)
  } finally { processing.value = false }
}

/* ── Download ── */
function downloadResult() {
  if (!resultBlob.value || !imageFile.value) return
  const ext = exportFormat.value.split('/')[1]
  downloadBlob(resultBlob.value, generateFilename(imageFile.value.name, 'color-replaced', ext))
}
</script>

<style scoped>
.tool-page__sidebar-title {
  display: flex; align-items: center; gap: var(--space-xs);
  font-size: var(--text-lg); font-weight: var(--weight-semibold); color: var(--color-ink);
  margin-bottom: var(--space-base);
}

/* Controls */
.control-group { display: flex; flex-direction: column; gap: var(--space-xs); }
.control-label { font-size: 9px; color: var(--color-muted); text-transform: uppercase; }
.control-row { display: flex; align-items: center; gap: var(--space-sm); }
.control-slider { flex: 1; accent-color: var(--color-primary); }
.control-value { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); min-width: 32px; text-align: right; }
.color-row { display: flex; align-items: center; gap: var(--space-sm); }
.color-picker { width: 40px; height: 32px; border: 1px solid var(--color-hairline); border-radius: var(--radius-md); cursor: pointer; padding: 2px; }
.color-hex { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); }
.hint { font-size: 9px; color: var(--color-muted); }
.checkbox-label { display: flex; align-items: center; gap: var(--space-xs); font-size: var(--text-sm); color: var(--color-body); cursor: pointer; }

/* Format buttons */
.format-options { display: flex; gap: var(--space-xs); }
.format-btn {
  padding: var(--space-xs) var(--space-base); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; font-size: 10px; color: var(--color-body); transition: all 0.15s ease;
}
.format-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }

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
  position: relative;
  cursor: crosshair;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  background: repeating-conic-gradient(var(--color-canvas-soft) 0% 25%, var(--color-canvas) 0% 50%) 0 0 / 16px 16px;
}

.zoom-badge { font-size: 10px; font-family: var(--font-mono); color: var(--color-primary); background: var(--color-canvas-soft); padding: 1px 6px; border-radius: 3px; }
.zoom-reset {
  font-size: 9px; color: var(--color-muted); background: none; border: 1px solid var(--color-hairline);
  border-radius: 3px; cursor: pointer; padding: 1px 6px;
}
.zoom-reset:hover { color: var(--color-primary); border-color: var(--color-primary); }

.hidden-canvas { display: none; }
.preview-img {
  max-width: 100%;
  max-height: 100%;
  image-rendering: auto;
  transition: transform 0.1s ease;
  pointer-events: none;
  user-select: none;
}
</style>
