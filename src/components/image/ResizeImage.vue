<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <!-- Left: Controls -->
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Ruler :size="16" />
          <px-text>调整尺寸</px-text>
        </div>

        <px-card>
          <template #header>上传图片</template>
          <ImageUploader v-model="imageFile" />
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>功能模式</template>
          <PxSegmented v-model="toolMode" :options="[
            { value: 'resize', label: '缩放' },
            { value: 'crop', label: '裁剪' },
          ]" />
        </px-card>

        <!-- 缩放参数 -->
        <px-card v-if="imageFile && toolMode === 'resize'" class="mt-base">
          <template #header>缩放设置</template>
          <div class="control-group">
            <label class="control-label"><px-text>缩放模式</px-text></label>
            <PxSegmented v-model="mode" :options="[{ value: 'pixel', label: '像素缩放' }, { value: 'smooth', label: '平滑缩放' }]" />
          </div>
          <div v-if="originalSize" class="control-group mt-base">
            <label class="control-label"><px-text>原始尺寸: {{ originalSize.width }} × {{ originalSize.height }}</px-text></label>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>目标宽度 (px)</px-text></label>
            <PxNumberInput v-model="targetWidth" :min="1" />
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>目标高度 (px)</px-text></label>
            <PxNumberInput v-model="targetHeight" :min="1" />
          </div>
          <div class="mt-base">
            <PxSwitch v-model="maintainRatio" label="保持宽高比" />
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="processing" @click="processResize">
              {{ processing ? '处理中...' : '开始缩放' }}
            </px-button>
          </div>
        </px-card>

        <!-- 裁剪参数 -->
        <px-card v-if="imageFile && toolMode === 'crop'" class="mt-base">
          <template #header>裁剪设置</template>
          <div v-if="originalSize" class="control-group">
            <label class="control-label"><px-text>在预览区拖拽选区，或手动输入坐标</px-text></label>
          </div>
          <div class="crop-inputs mt-base">
            <div class="crop-input-row">
              <div class="control-group">
                <label class="control-label">X</label>
                <PxNumberInput v-model="cropX" :min="0" />
              </div>
              <div class="control-group">
                <label class="control-label">Y</label>
                <PxNumberInput v-model="cropY" :min="0" />
              </div>
            </div>
            <div class="crop-input-row mt-sm">
              <div class="control-group">
                <label class="control-label">宽度</label>
                <PxNumberInput v-model="cropW" :min="1" />
              </div>
              <div class="control-group">
                <label class="control-label">高度</label>
                <PxNumberInput v-model="cropH" :min="1" />
              </div>
            </div>
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="processing || cropW <= 0 || cropH <= 0" @click="processCrop">
              {{ processing ? '处理中...' : '开始裁剪' }}
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
          <div v-if="resultInfo" class="result-info mt-base">
            <div class="result-row"><span>新尺寸</span><span>{{ resultInfo.width }} × {{ resultInfo.height }}</span></div>
            <div class="result-row"><span>文件大小</span><span>{{ resultInfo.size }}</span></div>
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
          <Ruler :size="48" :stroke-width="1" />
          <p>上传图片开始调整尺寸</p>
        </div>

        <div v-else class="preview-area">
          <!-- 缩放预览 -->
          <div v-if="toolMode === 'resize'" class="resize-preview-wrap">
            <CanvasPreview :src="previewSrc" label="缩放预览" :fill="true" />
          </div>

          <!-- 裁剪预览 -->
          <div v-if="toolMode === 'crop'" class="tool-page__compare" style="align-items: stretch;">
            <!-- 裁剪预览 -->
            <div class="preview-card">
              <div class="preview-card__header">裁剪预览（拖拽选择区域）</div>
              <div
                class="preview-card__canvas crop-canvas-wrap"
                :style="{ cursor: cropCursor }"
                ref="cropWrapRef"
                @mousedown="onCropMouseDown"
                @mousemove="onCropMouseMove"
                @mouseup="onCropMouseUp"
                @mouseleave="onCropMouseLeave"
              >
                <img
                  ref="cropImgRef"
                  :src="cropImgSrc"
                  class="crop-canvas-wrap__img pixel-render"
                  @load="onCropImgLoad"
                />
                <!-- dark overlay -->
                <svg v-if="cropW > 0 && cropH > 0" class="crop-overlay-svg">
                  <defs>
                    <mask id="crop-mask">
                      <rect x="0" y="0" width="100%" height="100%" fill="white" />
                      <rect :x="cropDispX" :y="cropDispY" :width="cropDispW" :height="cropDispH" fill="black" />
                    </mask>
                  </defs>
                  <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.45)" mask="url(#crop-mask)" />
                  <rect
                    :x="cropDispX" :y="cropDispY" :width="cropDispW" :height="cropDispH"
                    fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-dasharray="6 3"
                  />
                  <!-- resize handles -->
                  <rect v-for="handle in cropHandles" :key="handle.id"
                    :x="handle.x - 4" :y="handle.y - 4" width="8" height="8"
                    fill="white" stroke="var(--color-primary)" stroke-width="1.5" rx="1"
                  />
                  <text :x="cropDispX + cropDispW / 2" :y="cropDispY + cropDispH + 16" text-anchor="middle"
                    fill="var(--color-primary)" font-size="11" font-family="monospace">
                    {{ cropW }} × {{ cropH }}
                  </text>
                </svg>
              </div>
            </div>

            <!-- 裁剪结果 -->
            <CanvasPreview v-if="previewSrc" :src="previewSrc" label="裁剪结果" :fill="true" />
            <div v-else class="preview-card">
              <div class="preview-card__header">裁剪结果</div>
              <div class="preview-card__canvas">
                <span style="color: var(--color-muted); font-size: var(--text-sm);">点击「开始裁剪」查看结果</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Ruler, Download, Maximize2, Crop } from 'lucide-vue-next'
import { loadImageToCanvas, canvasToBlob, getImageDimensions, downloadBlob, formatFileSize, generateFilename } from '../../utils/canvas'
import { resizeImage, pixelResize } from '../../utils/resize'
import ImageUploader from '../common/ImageUploader.vue'
import CanvasPreview from '../common/CanvasPreview.vue'

/* ── State ── */
const imageFile = ref<File | null>(null)
const imageSrc = ref('')

const toolMode = ref<'resize' | 'crop'>('resize')
const mode = ref<'pixel' | 'smooth'>('smooth')
const targetWidth = ref(800)
const targetHeight = ref(600)
const maintainRatio = ref(true)
const exportFormat = ref<'image/png' | 'image/jpeg' | 'image/webp'>('image/png')
const exportQuality = ref(0.92)

const formats = [
  { value: 'image/png' as const, label: 'PNG' },
  { value: 'image/jpeg' as const, label: 'JPEG' },
  { value: 'image/webp' as const, label: 'WebP' },
]

const processing = ref(false)
const resultBlob = ref<Blob | null>(null)
const resultUrl = ref('')
const resultInfo = ref<{ width: number; height: number; size: string } | null>(null)
const originalSize = ref<{ width: number; height: number } | null>(null)

const previewSrc = ref('')

/* ── Crop State ── */
const cropWrapRef = ref<HTMLDivElement | null>(null)
const cropImgRef = ref<HTMLImageElement | null>(null)
const cropImgSrc = ref('')
const cropImgNatW = ref(0)
const cropImgNatH = ref(0)
const cropDispW_total = ref(0)
const cropDispH_total = ref(0)
const cropImgOffsetX = ref(0)
const cropImgOffsetY = ref(0)

const cropX = ref(0)
const cropY = ref(0)
const cropW = ref(0)
const cropH = ref(0)

let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragStartCropX = 0
let dragStartCropY = 0
let dragStartCropW = 0
let dragStartCropH = 0
let dragType: 'new' | 'move' = 'new'

/* ── Computed ── */
// Scale from display coords to actual image coords
const cropScale = computed(() => {
  if (!cropDispW_total.value || !cropImgNatW.value) return 1
  return cropImgNatW.value / cropDispW_total.value
})

const cropDispX = computed(() => Math.round(cropX.value / cropScale.value) + cropImgOffsetX.value)
const cropDispY = computed(() => Math.round(cropY.value / cropScale.value) + cropImgOffsetY.value)
const cropDispW = computed(() => Math.round(cropW.value / cropScale.value))
const cropDispH = computed(() => Math.round(cropH.value / cropScale.value))

/* ── Watchers ── */
watch(imageFile, async (f) => {
  // Clean up previous URLs
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
  if (cropImgSrc.value) URL.revokeObjectURL(cropImgSrc.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  resultBlob.value = null
  resultUrl.value = ''
  previewSrc.value = ''
  resultInfo.value = null

  if (!f) { originalSize.value = null; imageSrc.value = ''; cropImgSrc.value = ''; return }

  const url = URL.createObjectURL(f)
  imageSrc.value = url
  cropImgSrc.value = url

  const dims = await getImageDimensions(f)
  originalSize.value = dims
  targetWidth.value = dims.width
  targetHeight.value = dims.height
  const qw = Math.max(1, Math.round(dims.width / 4))
  const qh = Math.max(1, Math.round(dims.height / 4))
  cropX.value = Math.round(dims.width * 0.1)
  cropY.value = Math.round(dims.height * 0.1)
  cropW.value = qw
  cropH.value = qh
})

watch(targetWidth, (w) => {
  if (maintainRatio.value && originalSize.value) {
    targetHeight.value = Math.round(originalSize.value.height * (w / originalSize.value.width))
  }
})

/* ── Crop Image Load ── */
function onCropImgLoad() {
  const img = cropImgRef.value
  if (!img) return
  cropImgNatW.value = img.naturalWidth
  cropImgNatH.value = img.naturalHeight
  updateCropDisplaySize()
}

function updateCropDisplaySize() {
  const img = cropImgRef.value
  if (!img) return
  const wrapRect = cropWrapRef.value?.getBoundingClientRect()
  if (!wrapRect) return
  const wrapW = wrapRect.width
  const wrapH = wrapRect.height
  const natW = cropImgNatW.value
  const natH = cropImgNatH.value
  const scale = Math.min(wrapW / natW, wrapH / natH, 1)
  const dispW = natW * scale
  const dispH = natH * scale
  cropDispW_total.value = dispW
  cropDispH_total.value = dispH
  cropImgOffsetX.value = (wrapW - dispW) / 2
  cropImgOffsetY.value = (wrapH - dispH) / 2
}

/* ── Crop Mouse Events ── */
function getImgCoords(e: MouseEvent) {
  const wrap = cropWrapRef.value
  if (!wrap) return { dx: 0, dy: 0, ix: 0, iy: 0 }
  const rect = wrap.getBoundingClientRect()
  const wx = e.clientX - rect.left
  const wy = e.clientY - rect.top
  const dx = wx - cropImgOffsetX.value
  const dy = wy - cropImgOffsetY.value
  const ix = dx * cropScale.value
  const iy = dy * cropScale.value
  return { dx, dy, ix, iy }
}

function isInsideCrop(ix: number, iy: number) {
  return ix >= cropX.value && ix <= cropX.value + cropW.value &&
         iy >= cropY.value && iy <= cropY.value + cropH.value
}

function onCropMouseDown(e: MouseEvent) {
  e.preventDefault()
  updateCropDisplaySize()
  const { ix, iy } = getImgCoords(e)

  if (isInsideCrop(ix, iy)) {
    // Move existing selection
    dragType = 'move'
    dragStartX = ix
    dragStartY = iy
    dragStartCropX = cropX.value
    dragStartCropY = cropY.value
  } else {
    // Start new selection
    dragType = 'new'
    cropX.value = Math.max(0, Math.round(ix))
    cropY.value = Math.max(0, Math.round(iy))
    cropW.value = 0
    cropH.value = 0
    dragStartX = ix
    dragStartY = iy
  }
  isDragging = true
}

function onCropMouseMove(e: MouseEvent) {
  if (!isDragging) return
  const { ix, iy } = getImgCoords(e)
  const maxW = cropImgNatW.value
  const maxH = cropImgNatH.value

  if (dragType === 'new') {
    const x1 = Math.max(0, Math.min(dragStartX, ix))
    const y1 = Math.max(0, Math.min(dragStartY, iy))
    const x2 = Math.min(maxW, Math.max(dragStartX, ix))
    const y2 = Math.min(maxH, Math.max(dragStartY, iy))
    cropX.value = Math.round(x1)
    cropY.value = Math.round(y1)
    cropW.value = Math.round(x2 - x1)
    cropH.value = Math.round(y2 - y1)
  } else {
    // Move
    const dx = ix - dragStartX
    const dy = iy - dragStartY
    let nx = dragStartCropX + dx
    let ny = dragStartCropY + dy
    nx = Math.max(0, Math.min(nx, maxW - cropW.value))
    ny = Math.max(0, Math.min(ny, maxH - cropH.value))
    cropX.value = Math.round(nx)
    cropY.value = Math.round(ny)
  }
}

function onCropMouseUp() {
  isDragging = false
}

function onCropMouseLeave() {
  isDragging = false
}

const cropCursor = computed(() => {
  if (isDragging) return 'grabbing'
  return 'crosshair'
})

const cropHandles = computed(() => {
  if (cropW.value <= 0 || cropH.value <= 0) return []
  const x = cropDispX.value
  const y = cropDispY.value
  const w = cropDispW.value
  const h = cropDispH.value
  return [
    { id: 'tl', x, y },
    { id: 'tr', x: x + w, y },
    { id: 'bl', x, y: y + h },
    { id: 'br', x: x + w, y: y + h },
  ]
})

/* ── Process: Resize ── */
async function processResize() {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const resultCanvas = mode.value === 'pixel'
      ? pixelResize(canvas, targetWidth.value, targetHeight.value)
      : await resizeImage(canvas, targetWidth.value, targetHeight.value)
    const blob = await canvasToBlob(resultCanvas, exportFormat.value, exportQuality.value)
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    if (previewSrc.value) URL.revokeObjectURL(previewSrc.value)
    resultBlob.value = blob
    resultUrl.value = URL.createObjectURL(blob)
    previewSrc.value = resultUrl.value
    resultInfo.value = { width: targetWidth.value, height: targetHeight.value, size: formatFileSize(blob.size) }
  } finally { processing.value = false }
}

/* ── Process: Crop ── */
async function processCrop() {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const cx = Math.max(0, cropX.value)
    const cy = Math.max(0, cropY.value)
    const cw = Math.min(Math.max(1, cropW.value), canvas.width - cx)
    const ch = Math.min(Math.max(1, cropH.value), canvas.height - cy)

    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = cw
    croppedCanvas.height = ch
    const ctx = croppedCanvas.getContext('2d')!
    ctx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch)

    const blob = await canvasToBlob(croppedCanvas, exportFormat.value, exportQuality.value)
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    if (previewSrc.value) URL.revokeObjectURL(previewSrc.value)
    resultBlob.value = blob
    resultUrl.value = URL.createObjectURL(blob)
    previewSrc.value = resultUrl.value
    resultInfo.value = { width: cw, height: ch, size: formatFileSize(blob.size) }
  } finally { processing.value = false }
}

/* ── Download ── */
async function downloadResult() {
  if (!resultBlob.value || !imageFile.value) return
  const ext = exportFormat.value.split('/')[1]
  downloadBlob(resultBlob.value, generateFilename(imageFile.value.name, toolMode.value === 'crop' ? 'cropped' : 'resized', ext))
}
</script>

<style scoped>
.tool-page__sidebar-title {
  display: flex; align-items: center; gap: var(--space-xs);
  font-size: var(--text-lg); font-weight: var(--weight-semibold); color: var(--color-ink);
  margin-bottom: var(--space-base);
}

.control-group { display: flex; flex-direction: column; gap: var(--space-xs); }
.control-label { font-size: 10px; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.control-row { display: flex; align-items: center; gap: var(--space-sm); }
.control-slider { flex: 1; accent-color: var(--color-primary); }
.control-value { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); min-width: 44px; text-align: right; }
.control-input {
  padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); width: 100%;
}
.format-options { display: flex; gap: var(--space-xs); }
.format-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: var(--space-xs) var(--space-base); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; font-size: 10px; color: var(--color-body); transition: all 0.15s ease;
}
.format-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }
.checkbox-label { display: flex; align-items: center; gap: var(--space-xs); font-size: var(--text-sm); color: var(--color-body); cursor: pointer; }
.result-info { display: flex; flex-direction: column; gap: var(--space-xs); }
.result-row { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--color-body); }

/* ── Preview Area ── */
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
  padding: var(--space-sm) var(--space-base);
  border-bottom: 1px solid var(--color-hairline);
  font-size: var(--text-sm); color: var(--color-body);
}
.preview-card__canvas {
  flex: 1; min-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

/* Resize preview: full width/height when solo */
.resize-preview-wrap {
  width: 100%;
  height: 100%;
  display: flex;
}
.resize-preview-wrap :deep(.canvas-preview) {
  width: 100%;
  height: 100%;
}
.resize-preview-wrap :deep(.canvas-preview__canvas) {
  max-height: none;
  width: 100%;
  height: 100%;
}

/* ── Crop ── */
.crop-inputs { display: flex; flex-direction: column; gap: var(--space-xs); }
.crop-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm); }
.mt-sm { margin-top: var(--space-xs); }

.crop-canvas-wrap {
  position: relative;
  cursor: crosshair;
  user-select: none;
  background: repeating-conic-gradient(var(--color-canvas-soft) 0% 25%, var(--color-canvas) 0% 50%) 0 0 / 16px 16px;
}
.crop-canvas-wrap__img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none;
}
.crop-overlay-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
