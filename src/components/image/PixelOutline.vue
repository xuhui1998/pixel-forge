<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <PenTool :size="16" />
          <px-text>像素描边</px-text>
        </div>

        <px-card>
          <template #header>上传图片</template>
          <ImageUploader v-model="imageFile" />
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>描边设置</template>
          <div class="control-group">
            <label class="control-label"><px-text>描边颜色</px-text></label>
            <div class="color-row">
              <PxColorPicker v-model="outlineColor" show-hex />
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>描边宽度</px-text></label>
            <div class="control-row">
              <PxSlider v-model="outlineWidth" :min="1" :max="8" :step="1" />
              <span class="control-value">{{ outlineWidth }}px</span>
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>描边样式</px-text></label>
            <PxSegmented v-model="outlineStyle" :options="[
              { value: 'full', label: '完整描边' },
              { value: 'outer', label: '外描边' },
              { value: 'inner', label: '内描边' },
            ]" />
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="processing" @click="processOutline">
              {{ processing ? '处理中...' : '应用描边' }}
            </px-button>
          </div>
        </px-card>

        <px-card v-if="resultBlob" class="mt-base">
          <template #header>导出</template>
          <div class="control-group">
            <label class="control-label"><px-text>输出格式</px-text></label>
            <PxSegmented v-model="exportFormat" :options="formats" />
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="!resultBlob" @click="downloadResult">
              <Download :size="14" /> 下载
            </px-button>
          </div>
        </px-card>
      </div>

      <div class="tool-page__main">
        <div v-if="!imageFile" class="tool-page__empty">
          <PenTool :size="48" :stroke-width="1" />
          <p>上传图片后在此预览</p>
        </div>
        <div v-else class="tool-page__compare">
          <CanvasPreview :src="originalUrl" label="原图" :fill="true" />
          <CanvasPreview v-if="resultUrl" :src="resultUrl" label="描边结果" :fill="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { PenTool, Download } from 'lucide-vue-next'
import { loadImageToCanvas, canvasToBlob, downloadBlob, generateFilename } from '../../utils/canvas'
import { addPixelOutline } from '../../utils/outline'
import ImageUploader from '../common/ImageUploader.vue'
import CanvasPreview from '../common/CanvasPreview.vue'

type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp'

const imageFile = ref<File | null>(null)
const originalUrl = ref('')
const resultUrl = ref('')
const resultBlob = ref<Blob | null>(null)
const processing = ref(false)
const outlineColor = ref('#000000')
const outlineWidth = ref(2)
const outlineStyle = ref<'full' | 'inner' | 'outer'>('full')
const exportFormat = ref<ExportFormat>('image/png')

const formats = [
  { value: 'image/png' as ExportFormat, label: 'PNG' },
  { value: 'image/jpeg' as ExportFormat, label: 'JPEG' },
  { value: 'image/webp' as ExportFormat, label: 'WebP' },
]

function hexToRGBA(hex: string): [number, number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b, 255]
}

watch(imageFile, (f) => {
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  resultUrl.value = ''; resultBlob.value = null
  originalUrl.value = f ? URL.createObjectURL(f) : ''
})

async function processOutline() {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const result = addPixelOutline(canvas, {
      color: hexToRGBA(outlineColor.value),
      width: outlineWidth.value,
      style: outlineStyle.value,
    })
    const blob = await canvasToBlob(result, exportFormat.value, 0.92)
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultBlob.value = blob
    resultUrl.value = URL.createObjectURL(blob)
  } catch (e) { console.error(e) } finally { processing.value = false }
}

async function downloadResult() {
  if (!resultBlob.value || !imageFile.value) return
  const ext = exportFormat.value.split('/')[1]
  downloadBlob(resultBlob.value, generateFilename(imageFile.value.name, 'outline', ext))
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
.format-options { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.format-btn {
  padding: var(--space-xs) var(--space-base); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; font-size: 10px; color: var(--color-body); transition: all 0.15s ease;
}
.format-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }
.color-row { display: flex; align-items: center; gap: var(--space-sm); }
.color-input { width: 36px; height: 28px; border: 1px solid var(--color-hairline); border-radius: var(--radius-md); cursor: pointer; padding: 2px; }
</style>
