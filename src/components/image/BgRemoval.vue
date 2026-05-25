<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <!-- Left: Controls -->
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Scissors :size="16" />
          <px-text>背景移除</px-text>
        </div>

        <px-card>
          <template #header>上传图片</template>
          <ImageUploader v-model="imageFile" />
        </px-card>
        <px-card v-if="imageFile" class="mt-base">
          <template #header>移除参数</template>
          <div class="control-group">
            <label class="control-label"><px-text>背景颜色 (点击图片拾取)</px-text></label>
            <div class="color-row">
              <PxColorPicker v-model="bgColorHex" show-hex />
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>容差 (0 - 100)</px-text></label>
            <div class="control-row">
              <PxSlider v-model="tolerance" :min="0" :max="100" :step="1" />
              <span class="control-value">{{ tolerance }}</span>
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>边缘羽化 (px)</px-text></label>
            <div class="control-row">
              <PxSlider v-model="feather" :min="0" :max="10" :step="1" />
              <span class="control-value">{{ feather }}</span>
            </div>
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="!imageFile || processing" @click="processRemove">
              {{ processing ? '处理中...' : '移除背景' }}
            </px-button>
          </div>
        </px-card>

        <!-- Export -->
        <px-card v-if="imageFile" class="mt-base">
          <template #header>导出</template>
          <div class="control-group">
            <label class="control-label"><px-text>输出格式</px-text></label>
            <div class="format-options">
              <button class="format-btn active">PNG</button>
            </div>
            <span class="hint">透明背景仅支持 PNG 格式</span>
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="!resultBlob" @click="downloadResult">
              <Download :size="14" /> 下载 PNG
            </px-button>
          </div>
        </px-card>
      </div>

      <!-- Right: Preview -->
      <div class="tool-page__main">
        <div v-if="imageFile" class="tool-page__result-full">
          <div class="preview-card">
            <div class="preview-card__header">
              <px-text class="preview-card__label">预览 (点击拾取背景色)</px-text>
            </div>
            <div class="canvas-wrapper checkerboard" @click="pickColor">
              <img v-if="!resultUrl && previewSrc" :src="previewSrc" ref="previewImg" class="preview-img" />
              <img v-if="resultUrl" :src="resultUrl" class="preview-img" />
            </div>
          </div>
        </div>
        <div v-else class="tool-page__empty">
          <Scissors :size="48" :stroke-width="1" />
          <p>上传图片后在此预览</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Scissors, Download } from 'lucide-vue-next'
import { loadImageToCanvas, downloadBlob, generateFilename } from '../../utils/canvas'
import ImageUploader from '../common/ImageUploader.vue'

const imageFile = ref<File | null>(null)
const bgColorHex = ref('#ffffff')
const tolerance = ref(30)
const feather = ref(2)
const processing = ref(false)
const resultBlob = ref<Blob | null>(null)
const resultUrl = ref('')
const previewImg = ref<HTMLImageElement | null>(null)

const previewSrc = computed(() => imageFile.value ? URL.createObjectURL(imageFile.value) : '')

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

async function processRemove() {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const [tr, tg, tb] = hexToRgb(bgColorHex.value)
    const tol = tolerance.value
    const f = feather.value

    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i] - tr, dg = data[i + 1] - tg, db = data[i + 2] - tb
      const dist = Math.sqrt(dr * dr + dg * dg + db * db)
      const maxDist = tol * 4.41 // ~sqrt(3)*255/100 * tol/100
      if (dist <= maxDist) {
        data[i + 3] = 0
      } else if (f > 0 && dist <= maxDist + f * 10) {
        const alpha = Math.min(255, Math.round(((dist - maxDist) / (f * 10)) * 255))
        data[i + 3] = alpha
      }
    }
    ctx.putImageData(imageData, 0, 0)
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'))
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultBlob.value = blob
    resultUrl.value = URL.createObjectURL(blob)
  } finally { processing.value = false }
}

function pickColor(e: MouseEvent) {
  if (!previewImg.value || resultUrl.value) return
  const canvas = document.createElement('canvas')
  const img = previewImg.value
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  const rect = img.getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) / rect.width * canvas.width)
  const y = Math.floor((e.clientY - rect.top) / rect.height * canvas.height)
  const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
  bgColorHex.value = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
}

function downloadResult() {
  if (!resultBlob.value || !imageFile.value) return
  downloadBlob(resultBlob.value, generateFilename(imageFile.value.name, 'no-bg', 'png'))
}
</script>

<style scoped>
.tool-page__sidebar-title {
  display: flex; align-items: center; gap: var(--space-xs);
  font-size: var(--text-md); font-weight: var(--weight-semibold); color: var(--color-ink);
  margin-bottom: var(--space-base);
}
.preview-card {
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.preview-card__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-sm) var(--space-base);
  border-bottom: 1px solid var(--color-hairline-soft);
  flex-shrink: 0;
}
.preview-card__label {
  font-size: 9px; color: var(--color-muted); text-transform: uppercase; letter-spacing: var(--tracking-wider);
}

.control-group { display: flex; flex-direction: column; gap: var(--space-xs); }
.control-label { font-size: 9px; color: var(--color-muted); text-transform: uppercase; }
.control-row { display: flex; align-items: center; gap: var(--space-sm); }
.control-slider { flex: 1; accent-color: var(--color-primary); }
.control-value { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); min-width: 32px; text-align: right; }
.color-row { display: flex; align-items: center; gap: var(--space-sm); }
.color-picker { width: 40px; height: 32px; border: 1px solid var(--color-hairline); border-radius: var(--radius-md); cursor: pointer; padding: 2px; }
.color-hex { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); }
.hint { font-size: 9px; color: var(--color-muted); }
.format-options { display: flex; gap: var(--space-xs); }
.format-btn {
  padding: var(--space-xs) var(--space-base); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; font-family: var(--font-pixel); font-size: 9px; color: var(--color-body); transition: all 0.15s ease;
}
.format-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }
.canvas-wrapper {
  position: relative; cursor: crosshair; display: flex; justify-content: center; align-items: center;
  flex: 1; min-height: 0;
  background-image: linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
  background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0;
}
.preview-img { max-width: 100%; max-height: 100%; object-fit: contain; }
</style>
