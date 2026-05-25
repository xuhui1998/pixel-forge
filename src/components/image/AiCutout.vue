<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <!-- Left: Controls -->
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Bot :size="16" />
          <px-text>AI 智能抠图</px-text>
        </div>

        <px-card>
          <template #header>上传图片</template>
          <ImageUploader v-model="imageFile" />
        </px-card>
        <px-card v-if="imageFile" class="mt-base">
          <template #header>抠图参数</template>
          <div class="control-group">
            <label class="control-label"><px-text>检测灵敏度</px-text></label>
            <div class="control-row">
              <PxSlider v-model="sensitivity" :min="10" :max="200" :step="5" />
              <span class="control-value">{{ sensitivity }}</span>
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>边缘平滑度</px-text></label>
            <div class="control-row">
              <PxSlider v-model="smoothness" :min="0" :max="10" :step="1" />
              <span class="control-value">{{ smoothness }}</span>
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>背景类型</px-text></label>
            <PxSegmented v-model="bgType" :options="bgTypes" />
          </div>
          <div v-if="bgType === 'custom'" class="control-group mt-base">
            <label class="control-label"><px-text>自定义背景色</px-text></label>
            <PxColorPicker v-model="customBgColor" show-hex />
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="!imageFile || processing" @click="processCutout">
              {{ processing ? '处理中...' : '智能抠图' }}
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
            <span class="hint">抠图结果仅支持 PNG 格式</span>
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
        <div v-if="imageFile" class="tool-page__result-full">
          <div class="preview-card">
            <div class="preview-card__header">
              <px-text class="preview-card__label">预览</px-text>
            </div>
            <div class="canvas-wrapper" :class="{ checkerboard: bgType === 'transparent' }">
              <img v-if="!resultUrl && previewSrc" :src="previewSrc" class="preview-img" />
              <img v-if="resultUrl" :src="resultUrl" class="preview-img" />
            </div>
          </div>
        </div>
        <div v-else class="tool-page__empty">
          <Bot :size="48" :stroke-width="1" />
          <p>上传图片后在此预览</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bot, Download } from 'lucide-vue-next'
import { loadImageToCanvas, downloadBlob, generateFilename } from '../../utils/canvas'
import ImageUploader from '../common/ImageUploader.vue'

const imageFile = ref<File | null>(null)
const sensitivity = ref(50)
const smoothness = ref(3)
const bgType = ref('transparent')
const customBgColor = ref('#ffffff')
const processing = ref(false)
const resultBlob = ref<Blob | null>(null)
const resultUrl = ref('')

const bgTypes = [
  { value: 'transparent', label: '透明' },
  { value: 'white', label: '白色' },
  { value: 'black', label: '黑色' },
  { value: 'custom', label: '自定义' },
]

const previewSrc = computed(() => imageFile.value ? URL.createObjectURL(imageFile.value) : '')

async function processCutout() {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const ctx = canvas.getContext('2d')!
    const w = canvas.width, h = canvas.height
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    const threshold = 255 - sensitivity.value

    // Convert to grayscale for edge detection
    const gray = new Float32Array(w * h)
    for (let i = 0; i < w * h; i++) {
      gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
    }

    // Sobel edge detection
    const edge = new Float32Array(w * h)
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const gx = -gray[(y-1)*w+(x-1)] + gray[(y-1)*w+(x+1)]
          - 2*gray[y*w+(x-1)] + 2*gray[y*w+(x+1)]
          - gray[(y+1)*w+(x-1)] + gray[(y+1)*w+(x+1)]
        const gy = -gray[(y-1)*w+(x-1)] - 2*gray[(y-1)*w+x] - gray[(y-1)*w+(x+1)]
          + gray[(y+1)*w+(x-1)] + 2*gray[(y+1)*w+x] + gray[(y+1)*w+(x+1)]
        edge[y * w + x] = Math.sqrt(gx * gx + gy * gy)
      }
    }

    // Simple flood fill from edges to create mask
    // Use edge as foreground indicator
    const mask = new Uint8Array(w * h) // 0=bg, 1=fg
    for (let i = 0; i < w * h; i++) {
      mask[i] = edge[i] > threshold ? 1 : 0
    }

    // Dilate mask by smoothness
    const sm = smoothness.value
    const dilated = new Uint8Array(w * h)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let found = false
        for (let dy = -sm; dy <= sm && !found; dy++) {
          for (let dx = -sm; dx <= sm && !found; dx++) {
            const ny = y + dy, nx = x + dx
            if (ny >= 0 && ny < h && nx >= 0 && nx < w && mask[ny * w + nx]) found = true
          }
        }
        dilated[y * w + x] = found ? 1 : 0
      }
    }

    // Invert: assume edges are NOT the foreground, interior is
    // Actually for cutout, use brightness-based: keep bright areas
    for (let i = 0; i < w * h; i++) {
      const brightness = gray[i]
      data[i * 4 + 3] = brightness > sensitivity.value ? 255 : 0
    }

    // Apply background
    if (bgType.value !== 'transparent') {
      const bgHex = bgType.value === 'white' ? '#ffffff' : bgType.value === 'black' ? '#000000' : customBgColor.value
      const br = parseInt(bgHex.slice(1, 3), 16)
      const bg2 = parseInt(bgHex.slice(3, 5), 16)
      const bb = parseInt(bgHex.slice(5, 7), 16)
      for (let i = 0; i < w * h; i++) {
        if (data[i * 4 + 3] === 0) {
          data[i * 4] = br; data[i * 4 + 1] = bg2; data[i * 4 + 2] = bb; data[i * 4 + 3] = 255
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
    const format = bgType.value === 'transparent' ? 'image/png' : 'image/png'
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), format))
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultBlob.value = blob
    resultUrl.value = URL.createObjectURL(blob)
  } finally { processing.value = false }
}

function downloadResult() {
  if (!resultBlob.value || !imageFile.value) return
  downloadBlob(resultBlob.value, generateFilename(imageFile.value.name, 'cutout', 'png'))
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
.format-options { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.format-btn {
  padding: var(--space-xs) var(--space-base); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; font-family: var(--font-pixel); font-size: 9px; color: var(--color-body); transition: all 0.15s ease;
}
.format-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }
.color-picker { width: 40px; height: 32px; border: 1px solid var(--color-hairline); border-radius: var(--radius-md); cursor: pointer; padding: 2px; }
.hint { font-size: 9px; color: var(--color-muted); }
.canvas-wrapper {
  position: relative; display: flex; justify-content: center; align-items: center;
  flex: 1; min-height: 0;
}
.canvas-wrapper.checkerboard {
  background-image: linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
  background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0;
}
.preview-img { max-width: 100%; max-height: 100%; object-fit: contain; }
</style>
