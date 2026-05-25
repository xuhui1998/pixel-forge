<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <!-- Left: Controls -->
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <RefreshCw :size="16" />
          <px-text>格式转换</px-text>
        </div>

        <px-card>
          <template #header>上传图片</template>
          <ImageUploader v-model="imageFile" />
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>目标格式</template>
          <div class="control-group">
            <label class="control-label"><px-text>输出格式</px-text></label>
            <PxSegmented v-model="targetFormat" :options="formats" />
          </div>
          <div v-if="targetFormat !== 'image/png'" class="control-group mt-base">
            <label class="control-label"><px-text>质量</px-text></label>
            <div class="control-row">
              <PxSlider v-model="quality" :min="0.1" :max="1" :step="0.05" />
              <span class="control-value">{{ Math.round(quality * 100) }}%</span>
            </div>
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="!imageFile || processing" @click="processConvert">
              {{ processing ? '转换中...' : '开始转换' }}
            </px-button>
          </div>
        </px-card>

        <!-- Export section -->
        <px-card v-if="resultInfo" class="mt-base">
          <template #header>导出</template>
          <div class="result-info">
            <div class="result-row"><span>格式</span><span>{{ resultInfo.format }}</span></div>
            <div class="result-row"><span>大小</span><span>{{ resultInfo.size }}</span></div>
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
        <div v-if="imageFile" class="tool-page__compare">
          <CanvasPreview :src="previewSrc" label="原图" :fill="true" />
          <CanvasPreview v-if="resultUrl" :src="resultUrl" label="转换结果" :fill="true" />
        </div>
        <div v-else class="tool-page__empty">
          <RefreshCw :size="48" :stroke-width="1" />
          <p>上传图片后在此预览</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RefreshCw, Download } from 'lucide-vue-next'
import type { ImageFormat } from '../../types/image'
import { loadImageToCanvas, canvasToBlob, downloadBlob, formatFileSize, generateFilename } from '../../utils/canvas'
import { convertFormat, getExtension } from '../../utils/format-convert'
import ImageUploader from '../../components/common/ImageUploader.vue'
import CanvasPreview from '../../components/common/CanvasPreview.vue'

const imageFile = ref<File | null>(null)
const targetFormat = ref<ImageFormat>('image/png')
const quality = ref(0.92)
const processing = ref(false)
const resultBlob = ref<Blob | null>(null)
const resultUrl = ref('')
const resultInfo = ref<{ format: string; size: string } | null>(null)

const formats = [
  { value: 'image/png' as ImageFormat, label: 'PNG' },
  { value: 'image/jpeg' as ImageFormat, label: 'JPEG' },
  { value: 'image/webp' as ImageFormat, label: 'WebP' },
]

const previewSrc = computed(() => resultUrl.value || (imageFile.value ? URL.createObjectURL(imageFile.value) : ''))

async function processConvert() {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const blob = await convertFormat(canvas, targetFormat.value, quality.value)
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultBlob.value = blob
    resultUrl.value = URL.createObjectURL(blob)
    resultInfo.value = { format: getExtension(targetFormat.value).toUpperCase(), size: formatFileSize(blob.size) }
  } finally { processing.value = false }
}

function downloadResult() {
  if (!resultBlob.value || !imageFile.value) return
  const ext = getExtension(targetFormat.value)
  downloadBlob(resultBlob.value, generateFilename(imageFile.value.name, 'converted', ext))
}
</script>

<style scoped>
.tool-page__sidebar-title {
  display: flex; align-items: center; gap: var(--space-xs);
  font-size: var(--text-md); font-weight: var(--weight-semibold); color: var(--color-ink);
  margin-bottom: var(--space-base);
}
.control-group { display: flex; flex-direction: column; gap: var(--space-xs); }
.control-label { font-size: 9px; color: var(--color-muted); text-transform: uppercase; }
.control-row { display: flex; align-items: center; gap: var(--space-sm); }
.control-slider { flex: 1; accent-color: var(--color-primary); }
.control-value { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); min-width: 48px; text-align: right; }
.format-options { display: flex; gap: var(--space-xs); }
.format-btn {
  padding: var(--space-xs) var(--space-base); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; font-family: var(--font-pixel); font-size: 9px; color: var(--color-body); transition: all 0.15s ease;
}
.format-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }
.result-info { display: flex; flex-direction: column; gap: var(--space-xs); }
.result-row { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--color-body); }
</style>
