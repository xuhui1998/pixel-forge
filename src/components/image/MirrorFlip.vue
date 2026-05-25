<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <FlipHorizontal :size="16" />
          <px-text>镜像翻转与旋转</px-text>
        </div>

        <px-card>
          <template #header>上传图片</template>
          <ImageUploader v-model="imageFile" />
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>翻转</template>
          <div class="action-grid">
            <button class="action-card" @click="applyFlip('horizontal')" :disabled="processing">
              <FlipHorizontal :size="20" />
              <span>水平翻转</span>
            </button>
            <button class="action-card" @click="applyFlip('vertical')" :disabled="processing">
              <FlipVertical :size="20" />
              <span>垂直翻转</span>
            </button>
          </div>
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>旋转</template>
          <div class="action-grid">
            <button class="action-card" @click="applyRotate(90)" :disabled="processing">
              <RotateCw :size="20" />
              <span>顺时针 90°</span>
            </button>
            <button class="action-card" @click="applyRotate(180)" :disabled="processing">
              <RotateCw :size="20" />
              <span>旋转 180°</span>
            </button>
            <button class="action-card" @click="applyRotate(270)" :disabled="processing">
              <RotateCcw :size="20" />
              <span>逆时针 90°</span>
            </button>
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
          <FlipHorizontal :size="48" :stroke-width="1" />
          <p>上传图片后在此预览</p>
        </div>
        <div v-else class="tool-page__compare">
          <CanvasPreview :src="originalUrl" label="原图" :fill="true" />
          <CanvasPreview v-if="resultUrl" :src="resultUrl" label="变换结果" :fill="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { FlipHorizontal, FlipVertical, RotateCw, RotateCcw, Download } from 'lucide-vue-next'
import { loadImageToCanvas, canvasToBlob, downloadBlob, generateFilename } from '../../utils/canvas'
import { flipCanvas, rotateCanvas, type FlipDirection, type RotateAngle } from '../../utils/transform'
import ImageUploader from '../common/ImageUploader.vue'
import CanvasPreview from '../common/CanvasPreview.vue'

type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp'

const imageFile = ref<File | null>(null)
const originalUrl = ref('')
const resultUrl = ref('')
const resultBlob = ref<Blob | null>(null)
const processing = ref(false)
const exportFormat = ref<ExportFormat>('image/png')

const formats = [
  { value: 'image/png' as ExportFormat, label: 'PNG' },
  { value: 'image/jpeg' as ExportFormat, label: 'JPEG' },
  { value: 'image/webp' as ExportFormat, label: 'WebP' },
]

watch(imageFile, (f) => {
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  resultUrl.value = ''; resultBlob.value = null
  originalUrl.value = f ? URL.createObjectURL(f) : ''
})

async function applyFlip(direction: FlipDirection) {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const result = flipCanvas(canvas, direction)
    const blob = await canvasToBlob(result, exportFormat.value, 0.92)
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultBlob.value = blob
    resultUrl.value = URL.createObjectURL(blob)
  } catch (e) { console.error(e) } finally { processing.value = false }
}

async function applyRotate(angle: RotateAngle) {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const result = rotateCanvas(canvas, angle)
    const blob = await canvasToBlob(result, exportFormat.value, 0.92)
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultBlob.value = blob
    resultUrl.value = URL.createObjectURL(blob)
  } catch (e) { console.error(e) } finally { processing.value = false }
}

async function downloadResult() {
  if (!resultBlob.value || !imageFile.value) return
  const ext = exportFormat.value.split('/')[1]
  downloadBlob(resultBlob.value, generateFilename(imageFile.value.name, 'transformed', ext))
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
.format-options { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.format-btn {
  padding: var(--space-xs) var(--space-base); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; font-size: 10px; color: var(--color-body); transition: all 0.15s ease;
}
.format-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }
.action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xs); }
.action-card {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-xs);
  padding: var(--space-sm); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; font-size: 10px; color: var(--color-body);
  transition: all 0.15s ease;
}
.action-card:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.action-card:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
