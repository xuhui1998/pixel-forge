<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <!-- Left: Controls -->
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <SwatchBook :size="16" />
          <px-text>调色板提取与映射</px-text>
        </div>

        <px-card>
          <template #header>上传图片</template>
          <ImageUploader v-model="imageFile" />
        </px-card>

        <!-- Extracted Palette -->
        <px-card v-if="imageFile" class="mt-base">
          <template #header>
            <span class="card-header-row">
              <span>提取调色板</span>
              <div class="card-header-actions">
                <PxSelect v-model="extractCount" :options="extractCountOptions" @update:model-value="doExtract" />
                <button class="action-btn" @click="doExtract" title="重新提取">↻</button>
              </div>
            </span>
          </template>

          <div v-if="extractedPalette.length" class="palette-extract">
            <div class="color-grid">
              <div
                v-for="(c, i) in extractedPalette"
                :key="i"
                class="color-item"
                :style="{ background: c.hex }"
                :title="`${c.hex} (${Math.round(c.percentage * 100)}%)`"
                @click="copyHex(c.hex)"
              >
                <span class="color-item__pct">{{ Math.round(c.percentage * 100) }}%</span>
              </div>
            </div>
            <div class="palette-info">
              <span>共 {{ extractedPalette.length }} 色</span>
              <span v-if="uniqueCount > 0">原图 {{ uniqueCount }} 色</span>
            </div>
          </div>
          <div v-else class="empty-hint">
            <span v-if="extracting">提取中...</span>
            <span v-else>上传图片后自动提取</span>
          </div>

          <!-- Export extracted palette -->
          <div v-if="extractedPalette.length" class="export-row mt-base">
            <span class="control-label">导出调色板</span>
            <div class="format-options">
              <button class="format-btn" @click="handleExportPalette('gpl')">GPL</button>
              <button class="format-btn" @click="handleExportPalette('json')">JSON</button>
              <button class="format-btn" @click="handleExportPalette('txt')">TXT</button>
              <button class="format-btn" @click="handleExportPalette('hex')">HEX</button>
            </div>
          </div>
        </px-card>

        <!-- Preset Palette Mapping -->
        <px-card v-if="imageFile" class="mt-base">
          <template #header>映射到预置调色板</template>

          <div class="preset-list">
            <button
              v-for="(p, key) in presetPalettes"
              :key="key"
              class="preset-btn"
              :class="{ active: selectedPreset === key }"
              @click="onPresetSelect(key)"
            >
              <span class="preset-btn__name">{{ p.label }}</span>
              <span class="preset-btn__swatches">
                <span
                  v-for="(c, ci) in p.colors.slice(0, 12)"
                  :key="ci"
                  class="swatch xs"
                  :style="{ background: `rgb(${c[0]},${c[1]},${c[2]})` }"
                />
                <span v-if="p.colors.length > 12" class="swatch-more">+{{ p.colors.length - 12 }}</span>
              </span>
            </button>
          </div>

          <!-- Dither Mode -->
          <div v-if="selectedPreset" class="control-group mt-base">
            <label class="control-label"><px-text>抖动算法</px-text></label>
            <PxSegmented v-model="ditherMode" :options="ditherOptions" />
          </div>

          <div v-if="selectedPreset" class="mt-base">
            <px-button type="primary" :disabled="processing" @click="processMap">
              {{ processing ? '处理中...' : '应用调色板' }}
            </px-button>
          </div>
        </px-card>

        <!-- Export -->
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
            <div class="result-row"><span>尺寸</span><span>{{ resultInfo.width }} × {{ resultInfo.height }}</span></div>
            <div class="result-row"><span>调色板</span><span>{{ appliedPaletteLabel }}</span></div>
            <div class="result-row"><span>颜色数</span><span>{{ appliedColorCount }}</span></div>
            <div class="result-row"><span>抖动</span><span>{{ ditherMode === 'none' ? '无' : ditherMode }}</span></div>
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
          <SwatchBook :size="48" :stroke-width="1" />
          <p>上传图片后在此预览</p>
        </div>

        <div v-else class="preview-area">
          <!-- Original -->
          <div class="preview-card">
            <div class="preview-card__header">原始图片</div>
            <div class="preview-card__canvas">
              <CanvasPreview :src="originalUrl" label="原图" :fill="true" />
            </div>
          </div>

          <!-- Compare preview -->
          <div v-if="selectedPreset" class="preview-card">
            <div class="preview-card__header">
              <span>预览调色板：{{ presetPalettes[selectedPreset]?.label }}</span>
              <span class="preview-palette">
                <span
                  v-for="(c, i) in presetPalettes[selectedPreset]?.colors.slice(0, 20)"
                  :key="i"
                  class="swatch sm"
                  :style="{ background: `rgb(${c[0]},${c[1]},${c[2]})` }"
                />
                <span v-if="presetPalettes[selectedPreset].colors.length > 20" class="swatch-more">
                  +{{ presetPalettes[selectedPreset].colors.length - 20 }}
                </span>
              </span>
            </div>
            <div class="preview-card__canvas">
              <div v-if="previewUrl" class="preview-compare">
                <div class="preview-compare__item">
                  <CanvasPreview :src="originalUrl" label="原图" :fill="true" />
                </div>
                <div class="preview-compare__item">
                  <CanvasPreview :src="previewUrl" label="映射预览" :fill="true" />
                </div>
              </div>
              <div v-else class="empty-hint">点击「应用调色板」查看预览</div>
            </div>
          </div>

          <!-- Full Result -->
          <div v-if="resultUrl" class="preview-card">
            <div class="preview-card__header">映射结果</div>
            <div class="preview-card__canvas">
              <CanvasPreview :src="resultUrl" label="结果" :fill="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SwatchBook, Download } from 'lucide-vue-next'
import { loadImageToCanvas, canvasToBlob, downloadBlob, generateFilename, formatFileSize } from '../../utils/canvas'
import {
  extractPalette,
  getUniqueColors,
  mapToPalette,
  downloadPalette,
  PRESET_PALETTES,
  type PaletteColor,
  type DitherAlgorithm,
  type PaletteExportFormat,
} from '../../utils/palette'
import ImageUploader from '../common/ImageUploader.vue'
import CanvasPreview from '../common/CanvasPreview.vue'

type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp'

/* ── State ── */
const imageFile = ref<File | null>(null)
const originalUrl = ref('')
const previewUrl = ref('')
const resultUrl = ref('')
const resultBlob = ref<Blob | null>(null)
const processing = ref(false)
const extracting = ref(false)

const extractCount = ref(16)
const selectedPreset = ref<string | null>(null)
const ditherMode = ref<DitherAlgorithm>('floyd-steinberg')
const extractedPalette = ref<PaletteColor[]>([])
const uniqueCount = ref(0)

const extractCountOptions = [4,8,12,16,24,32,64].map(n => ({ label: `${n} 色`, value: n }))

const exportFormat = ref<ExportFormat>('image/png')
const exportQuality = ref(0.92)
const resultInfo = ref<{ width: number; height: number; size: string } | null>(null)

const presetPalettes = PRESET_PALETTES

const formats = [
  { value: 'image/png' as ExportFormat, label: 'PNG' },
  { value: 'image/jpeg' as ExportFormat, label: 'JPEG' },
  { value: 'image/webp' as ExportFormat, label: 'WebP' },
]

const ditherOptions = [
  { value: 'none' as DitherAlgorithm, label: '无' },
  { value: 'ordered' as DitherAlgorithm, label: '有序' },
  { value: 'floyd-steinberg' as DitherAlgorithm, label: 'F-S' },
  { value: 'atkinson' as DitherAlgorithm, label: 'Atkinson' },
]

const appliedPaletteLabel = computed(() => {
  if (!selectedPreset.value) return '-'
  return PRESET_PALETTES[selectedPreset.value]?.label ?? '-'
})

const appliedColorCount = computed(() => {
  if (!selectedPreset.value) return 0
  return PRESET_PALETTES[selectedPreset.value]?.colors.length ?? 0
})

/* ── Watchers ── */
watch(imageFile, async (f) => {
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  previewUrl.value = ''
  resultUrl.value = ''
  resultBlob.value = null
  resultInfo.value = null
  extractedPalette.value = []
  uniqueCount.value = 0

  if (f) {
    originalUrl.value = URL.createObjectURL(f)
    await doExtract()
  } else {
    originalUrl.value = ''
  }
})

/* ── Extract Palette ── */
async function doExtract() {
  if (!imageFile.value) return
  extracting.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    extractedPalette.value = extractPalette(canvas, extractCount.value)
    const unique = getUniqueColors(canvas)
    uniqueCount.value = unique.length
  } catch (e) {
    console.error(e)
  } finally {
    extracting.value = false
  }
}

/* ── Preset Select ── */
function onPresetSelect(key: string) {
  selectedPreset.value = selectedPreset.value === key ? null : key
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  resultUrl.value = ''
  resultBlob.value = null
}

/* ── Process Mapping ── */
async function processMap() {
  if (!imageFile.value || !selectedPreset.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const palette = PRESET_PALETTES[selectedPreset.value].colors

    const result = mapToPalette(canvas, palette, {
      dither: ditherMode.value,
      skipTransparent: true,
    })

    const blob = await canvasToBlob(result, exportFormat.value, exportQuality.value)

    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)

    previewUrl.value = ''
    resultBlob.value = blob
    resultUrl.value = URL.createObjectURL(blob)
    resultInfo.value = {
      width: canvas.width,
      height: canvas.height,
      size: formatFileSize(blob.size),
    }
  } catch (e) {
    console.error(e)
  } finally {
    processing.value = false
  }
}

/* ── Export Palette ── */
function handleExportPalette(format: PaletteExportFormat) {
  if (extractedPalette.value.length === 0) return
  downloadPalette(extractedPalette.value, format, 'pixelforge-palette')
}

/* ── Copy Hex ── */
function copyHex(hex: string) {
  navigator.clipboard.writeText(hex).catch(() => {})
}

/* ── Download Result ── */
async function downloadResult() {
  if (!resultBlob.value || !imageFile.value) return
  const ext = exportFormat.value.split('/')[1]
  downloadBlob(resultBlob.value, generateFilename(imageFile.value.name, 'palette-mapped', ext))
}
</script>

<style scoped>
.tool-page__sidebar-title {
  display: flex; align-items: center; gap: var(--space-xs);
  font-size: var(--text-lg); font-weight: var(--weight-semibold); color: var(--color-ink);
  margin-bottom: var(--space-base);
}

/* Card header with actions */
.card-header-row { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.card-header-actions { display: flex; gap: 4px; align-items: center; }
.select-sm {
  font-size: 10px; padding: 2px 4px; border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); color: var(--color-body); cursor: pointer;
}
.action-btn {
  width: 22px; height: 22px; border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; font-size: 12px; color: var(--color-body);
  display: flex; align-items: center; justify-content: center; transition: all 0.15s ease;
}
.action-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }

/* Controls */
.control-group { display: flex; flex-direction: column; gap: var(--space-xs); }
.control-label { font-size: 9px; color: var(--color-muted); text-transform: uppercase; }
.control-row { display: flex; align-items: center; gap: var(--space-sm); }
.control-slider { flex: 1; accent-color: var(--color-primary); }
.control-value { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); min-width: 48px; text-align: right; }

/* Format buttons */
.format-options { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.format-btn {
  padding: var(--space-xs) var(--space-base); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; font-size: 10px; color: var(--color-body); transition: all 0.15s ease;
}
.format-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }

/* Extracted palette */
.palette-extract { display: flex; flex-direction: column; gap: var(--space-xs); }
.color-grid { display: flex; flex-wrap: wrap; gap: 3px; }
.color-item {
  width: 24px; height: 24px; border-radius: 3px; border: 1px solid var(--color-hairline);
  cursor: pointer; position: relative; transition: transform 0.1s ease;
}
.color-item:hover { transform: scale(1.3); z-index: 1; }
.color-item__pct {
  position: absolute; bottom: -14px; left: 50%; transform: translateX(-50%);
  font-size: 7px; color: var(--color-muted); white-space: nowrap; pointer-events: none;
}
.palette-info { display: flex; justify-content: space-between; font-size: 9px; color: var(--color-muted); margin-top: 12px; }

/* Export row */
.export-row { display: flex; flex-direction: column; gap: 4px; }

/* Preset list */
.preset-list { display: flex; flex-direction: column; gap: 4px; max-height: 360px; overflow-y: auto; }
.preset-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 8px; border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; transition: all 0.15s ease;
  width: 100%; text-align: left;
}
.preset-btn:hover { border-color: var(--color-hairline-strong); }
.preset-btn.active { border-color: var(--color-primary); background: var(--color-canvas-soft); }
.preset-btn__name { font-size: 10px; color: var(--color-body); min-width: 90px; flex-shrink: 0; }
.preset-btn.active .preset-btn__name { color: var(--color-primary); }
.preset-btn__swatches { display: flex; gap: 2px; flex-wrap: wrap; }

/* Color swatch */
.swatch { display: inline-block; width: 14px; height: 14px; border-radius: 2px; border: 1px solid var(--color-hairline); flex-shrink: 0; }
.swatch.sm { width: 10px; height: 10px; }
.swatch.xs { width: 8px; height: 8px; border-width: 0; }
.swatch-more { font-size: 8px; color: var(--color-muted); line-height: 8px; margin-left: 2px; }

/* Empty hint */
.empty-hint { text-align: center; padding: var(--space-sm); color: var(--color-muted); font-size: var(--text-sm); }

/* Preview Area */
.preview-area { display: flex; flex-direction: column; gap: var(--space-base); height: 100%; }
.preview-card {
  display: flex; flex-direction: column;
  flex: 1; min-height: 0;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.preview-card__header {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: var(--space-sm) var(--space-base);
  border-bottom: 1px solid var(--color-hairline);
  font-size: var(--text-sm); color: var(--color-body);
}
.preview-card__canvas {
  flex: 1; min-height: 0;
  display: flex; justify-content: center; align-items: center;
  overflow: auto; padding: var(--space-base);
}

.preview-palette { display: flex; align-items: center; gap: 2px; }
.preview-compare { display: flex; gap: var(--space-base); width: 100%; height: 100%; }
.preview-compare__item { flex: 1; min-width: 0; min-height: 0; }
.result-info { display: flex; flex-direction: column; gap: var(--space-xs); }
.result-row { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--color-body); }
</style>
