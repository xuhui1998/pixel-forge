<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Layers :size="16" />
          <px-text>图片叠加与合成</px-text>
        </div>

        <px-card>
          <template #header>底图</template>
          <ImageUploader v-model="baseFile" />
        </px-card>

        <px-card class="mt-base">
          <template #header>叠加图</template>
          <ImageUploader v-model="overlayFile" />
        </px-card>

        <px-card v-if="baseFile && overlayFile" class="mt-base">
          <template #header>合成设置</template>
          <div class="control-group">
            <label class="control-label"><px-text>混合模式</px-text></label>
            <PxSelect v-model="blendMode" :options="blendModes" />
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>叠加透明度</px-text></label>
            <div class="control-row">
              <PxSlider v-model="opacity" :min="0" :max="1" :step="0.05" />
              <span class="control-value">{{ Math.round(opacity * 100) }}%</span>
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>叠加偏移 X</px-text></label>
            <div class="control-row">
              <PxSlider v-model="offsetX" :min="-1000" :max="1000" :step="1" />
              <span class="control-value">{{ offsetX }}px</span>
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>叠加偏移 Y</px-text></label>
            <div class="control-row">
              <PxSlider v-model="offsetY" :min="-1000" :max="1000" :step="1" />
              <span class="control-value">{{ offsetY }}px</span>
            </div>
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="processing" @click="processComposite">
              {{ processing ? '处理中...' : '合成图片' }}
            </px-button>
          </div>
        </px-card>

        <px-card v-if="resultBlob" class="mt-base">
          <template #header>导出</template>
          <div class="mt-base">
            <px-button type="primary" :disabled="!resultBlob" @click="downloadResult">
              <Download :size="14" /> 下载
            </px-button>
          </div>
        </px-card>
      </div>

      <div class="tool-page__main">
        <div v-if="!baseFile || !overlayFile" class="tool-page__empty">
          <Layers :size="48" :stroke-width="1" />
          <p>上传底图和叠加图后在此预览</p>
        </div>
        <div v-else class="tool-page__compare">
          <CanvasPreview :src="baseUrl" label="底图" :fill="true" />
          <CanvasPreview v-if="resultUrl" :src="resultUrl" label="合成结果" :fill="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Layers, Download } from 'lucide-vue-next'
import { loadImageToCanvas, canvasToBlob, downloadBlob, generateFilename } from '../../utils/canvas'
import { compositeImages, BLEND_MODES, type BlendMode } from '../../utils/composite'
import ImageUploader from '../common/ImageUploader.vue'
import CanvasPreview from '../common/CanvasPreview.vue'

const baseFile = ref<File | null>(null)
const overlayFile = ref<File | null>(null)
const baseUrl = ref('')
const resultUrl = ref('')
const resultBlob = ref<Blob | null>(null)
const processing = ref(false)
const blendMode = ref<BlendMode>('source-over')
const opacity = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)

const blendModes = BLEND_MODES

watch(baseFile, (f) => {
  if (baseUrl.value) URL.revokeObjectURL(baseUrl.value)
  baseUrl.value = f ? URL.createObjectURL(f) : ''
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  resultUrl.value = ''; resultBlob.value = null
})
watch(overlayFile, () => {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  resultUrl.value = ''; resultBlob.value = null
})

async function processComposite() {
  if (!baseFile.value || !overlayFile.value) return
  processing.value = true
  try {
    const baseCanvas = await loadImageToCanvas(baseFile.value)
    const overlayCanvas = await loadImageToCanvas(overlayFile.value)
    const result = compositeImages(baseCanvas, overlayCanvas, {
      blendMode: blendMode.value,
      opacity: opacity.value,
      offsetX: offsetX.value,
      offsetY: offsetY.value,
    })
    const blob = await canvasToBlob(result, 'image/png')
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultBlob.value = blob
    resultUrl.value = URL.createObjectURL(blob)
  } catch (e) { console.error(e) } finally { processing.value = false }
}

async function downloadResult() {
  if (!resultBlob.value || !baseFile.value) return
  downloadBlob(resultBlob.value, generateFilename(baseFile.value.name, 'composite', 'png'))
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
.select-sm {
  font-size: 10px; padding: 2px 4px; border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); color: var(--color-body); cursor: pointer; width: 100%;
}
</style>
