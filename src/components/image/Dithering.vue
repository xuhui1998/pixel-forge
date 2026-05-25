<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Blend :size="16" />
          <px-text>抖动处理</px-text>
        </div>

        <px-card>
          <template #header>上传图片</template>
          <ImageUploader v-model="imageFile" />
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>调色板</template>
          <div class="control-group">
            <label class="control-label"><px-text>选择调色板</px-text></label>
            <div class="palette-list">
              <button
                v-for="(p, key) in presetPalettes" :key="key"
                class="preset-btn" :class="{ active: paletteKey === key }"
                @click="paletteKey = key"
              >
                <span class="preset-btn__name">{{ p.label }}</span>
                <span class="preset-btn__swatches">
                  <span v-for="(c, ci) in p.colors.slice(0, 12)" :key="ci"
                    class="swatch xs" :style="{ background: `rgb(${c[0]},${c[1]},${c[2]})` }"
                  />
                </span>
              </button>
            </div>
          </div>
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>抖动算法</template>
          <div class="control-group">
            <label class="control-label"><px-text>算法</px-text></label>
            <PxSegmented v-model="algorithm" :options="ditherOptions" />
          </div>

          <div v-if="algorithm === 'ordered'" class="control-group mt-base">
            <label class="control-label"><px-text>Bayer 矩阵</px-text></label>
            <PxSegmented v-model="bayerSize" :options="[{ value: 4, label: '4×4' }, { value: 8, label: '8×8' }]" />
          </div>

          <div class="mt-base">
            <px-button type="primary" :disabled="processing" @click="processDither">
              {{ processing ? '处理中...' : '应用抖动' }}
            </px-button>
          </div>
        </px-card>

        <px-card v-if="resultBlob" class="mt-base">
          <template #header>导出</template>
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

      <div class="tool-page__main">
        <div v-if="!imageFile" class="tool-page__empty">
          <Blend :size="48" :stroke-width="1" />
          <p>上传图片后在此预览</p>
        </div>
        <div v-else class="tool-page__compare">
          <CanvasPreview :src="originalUrl" label="原图" :fill="true" />
          <CanvasPreview v-if="resultUrl" :src="resultUrl" label="抖动结果" :fill="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Blend, Download } from 'lucide-vue-next'
import { loadImageToCanvas, canvasToBlob, downloadBlob, generateFilename } from '../../utils/canvas'
import { applyDither, type DitherAlgorithm } from '../../utils/dithering'
import { PRESET_PALETTES } from '../../utils/palette'
import ImageUploader from '../common/ImageUploader.vue'
import CanvasPreview from '../common/CanvasPreview.vue'

type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp'

const imageFile = ref<File | null>(null)
const originalUrl = ref('')
const resultUrl = ref('')
const resultBlob = ref<Blob | null>(null)
const processing = ref(false)
const paletteKey = ref('pico8')
const algorithm = ref<DitherAlgorithm>('floyd-steinberg')
const bayerSize = ref<4 | 8>(4)
const exportFormat = ref<ExportFormat>('image/png')
const exportQuality = ref(0.92)

const presetPalettes = PRESET_PALETTES

const ditherOptions = [
  { value: 'none' as DitherAlgorithm, label: '无' },
  { value: 'floyd-steinberg' as DitherAlgorithm, label: 'Floyd-Steinberg' },
  { value: 'ordered' as DitherAlgorithm, label: '有序(Bayer)' },
  { value: 'atkinson' as DitherAlgorithm, label: 'Atkinson' },
]

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

async function processDither() {
  if (!imageFile.value || !paletteKey.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const palette = PRESET_PALETTES[paletteKey.value].colors
    const result = applyDither(canvas, { algorithm: algorithm.value, palette, bayerMatrixSize: bayerSize.value })
    const blob = await canvasToBlob(result, exportFormat.value, exportQuality.value)
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultBlob.value = blob
    resultUrl.value = URL.createObjectURL(blob)
  } catch (e) { console.error(e) } finally { processing.value = false }
}

async function downloadResult() {
  if (!resultBlob.value || !imageFile.value) return
  const ext = exportFormat.value.split('/')[1]
  downloadBlob(resultBlob.value, generateFilename(imageFile.value.name, 'dithered', ext))
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
.palette-list { display: flex; flex-direction: column; gap: 4px; max-height: 300px; overflow-y: auto; }
.preset-btn {
  display: flex; align-items: center; gap: 6px; padding: 5px 8px;
  border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; transition: all 0.15s ease; width: 100%; text-align: left;
}
.preset-btn:hover { border-color: var(--color-hairline-strong); }
.preset-btn.active { border-color: var(--color-primary); background: var(--color-canvas-soft); }
.preset-btn__name { font-size: 10px; color: var(--color-body); min-width: 90px; flex-shrink: 0; }
.preset-btn.active .preset-btn__name { color: var(--color-primary); }
.preset-btn__swatches { display: flex; gap: 2px; flex-wrap: wrap; }
.swatch.xs { display: inline-block; width: 8px; height: 8px; border-radius: 2px; border: none; }
</style>
