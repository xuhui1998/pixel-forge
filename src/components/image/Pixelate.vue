<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <!-- Left: Controls -->
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Grid3x3 :size="16" />
          <px-text>像素化处理</px-text>
        </div>

        <px-card>
          <template #header>上传图片</template>
          <ImageUploader v-model="imageFile" />
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>参数设置</template>

          <!-- 像素块大小 -->
          <div class="control-group">
            <label class="control-label"><px-text>像素块大小</px-text></label>
            <div class="control-row">
              <PxSlider v-model="pixelSize" :min="2" :max="64" :step="1" />
              <span class="control-value">{{ pixelSize }}px</span>
            </div>
          </div>

          <!-- 调色板预设 -->
          <div class="control-group mt-base">
            <label class="control-label"><px-text>调色板</px-text></label>
            <div class="palette-grid">
              <button
                v-for="(p, key) in palettes" :key="key"
                class="palette-btn"
                :class="{ active: paletteKey === key }"
                @click="onPaletteChange(key)"
                :title="p.label"
              >
                <span class="palette-btn__label">{{ p.label }}</span>
                <span v-if="p.colors.length" class="palette-btn__swatches">
                  <span v-for="(c, ci) in p.colors.slice(0, 8)" :key="ci"
                    class="swatch" :style="{ background: `rgb(${c[0]},${c[1]},${c[2]})` }"
                  />
                </span>
              </button>
            </div>
          </div>

          <!-- 颜色数量 (仅自动模式) -->
          <div v-if="paletteKey === 'none'" class="control-group mt-base">
            <label class="control-label"><px-text>颜色数量</px-text></label>
            <div class="control-row">
              <PxSlider v-model="colorCount" :min="2" :max="256" :step="1" />
              <span class="control-value">{{ colorCount }}</span>
            </div>
            <div class="preset-row">
              <button v-for="n in [2,4,8,16,32,64,128,256]" :key="n"
                class="preset-btn" :class="{ active: colorCount === n }"
                @click="colorCount = n">{{ n }}</button>
            </div>
          </div>

          <!-- 抖动模式 -->
          <div v-if="showDither" class="control-group mt-base">
            <label class="control-label"><px-text>抖动模式</px-text></label>
            <PxSegmented v-model="dither" :options="[
              { value: 'none', label: '无' },
              { value: 'ordered', label: '有序' },
              { value: 'floyd-steinberg', label: 'F-S' },
            ]" />
          </div>

          <!-- 灰度 -->
          <div class="mt-base">
            <PxSwitch v-model="grayscale" label="灰度模式" />
          </div>

          <div class="mt-base">
            <px-button type="primary" :disabled="!imageFile || processing" @click="processPixelate">
              {{ processing ? '处理中...' : '开始像素化' }}
            </px-button>
          </div>
        </px-card>

        <!-- Export -->
        <px-card v-if="imageFile" class="mt-base">
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
          <div v-if="resultInfo" class="result-info mt-base">
            <div class="result-row"><span>尺寸</span><span>{{ resultInfo.width }} × {{ resultInfo.height }}</span></div>
            <div class="result-row"><span>像素块</span><span>{{ pixelSize }}px</span></div>
            <div class="result-row"><span>颜色数</span><span>{{ lastPalette.length || '全色' }}</span></div>
            <div class="result-row"><span>文件大小</span><span>{{ resultInfo.size }}</span></div>
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="!processedBlob" @click="downloadResult">
              <Download :size="14" /> 下载
            </px-button>
          </div>
        </px-card>
      </div>

      <!-- Right: Preview -->
      <div class="tool-page__main">
        <div v-if="imageFile" class="tool-page__compare">
          <CanvasPreview :src="originalUrl" label="原图" :fill="true" />
          <CanvasPreview v-if="processedUrl" :src="processedUrl" label="像素化结果" :fill="true" />
        </div>
        <div v-else class="tool-page__empty">
          <Grid3x3 :size="48" :stroke-width="1" />
          <p>上传图片后在此预览</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Grid3x3, Download } from 'lucide-vue-next'
import { loadImageToCanvas, canvasToBlob, downloadBlob, generateFilename, formatFileSize } from '../../utils/canvas'
import { pixelate, PALETTES, extractPalette, type DitherMode } from '../../utils/pixelate'
import ImageUploader from '../common/ImageUploader.vue'
import CanvasPreview from '../common/CanvasPreview.vue'

type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp'

/* ── State ── */
const imageFile = ref<File | null>(null)
const originalUrl = ref('')
const processedUrl = ref('')
const processedBlob = ref<Blob | null>(null)
const processing = ref(false)

const pixelSize = ref(8)
const paletteKey = ref('none')
const colorCount = ref(32)
const dither = ref<DitherMode>('none')
const grayscale = ref(false)
const lastPalette = ref<[number, number, number][]>([])

const exportFormat = ref<ExportFormat>('image/png')
const exportQuality = ref(0.92)
const resultInfo = ref<{ width: number; height: number; size: string } | null>(null)

const palettes = PALETTES

const formats = [
  { value: 'image/png' as ExportFormat, label: 'PNG' },
  { value: 'image/jpeg' as ExportFormat, label: 'JPEG' },
  { value: 'image/webp' as ExportFormat, label: 'WebP' },
]

const showDither = computed(() => {
  if (grayscale.value) return true
  if (paletteKey.value !== 'none') return true
  return colorCount.value < 256
})

/* ── Watchers ── */
watch(imageFile, (f) => {
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
  if (processedUrl.value) URL.revokeObjectURL(processedUrl.value)
  processedUrl.value = ''
  processedBlob.value = null
  resultInfo.value = null
  lastPalette.value = []

  if (f) {
    originalUrl.value = URL.createObjectURL(f)
  } else {
    originalUrl.value = ''
  }
})

function onPaletteChange(key: string) {
  paletteKey.value = key
  // Adjust dither default for low-color palettes
  const colors = PALETTES[key]?.colors
  if (colors && colors.length <= 8 && dither.value === 'none') {
    dither.value = 'ordered'
  }
}

/* ── Process ── */
async function processPixelate() {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const palette = paletteKey.value !== 'none'
      ? (PALETTES[paletteKey.value]?.colors ?? null)
      : null

    const result = pixelate(canvas, {
      pixelSize: pixelSize.value,
      colorCount: colorCount.value,
      dither: dither.value,
      grayscale: grayscale.value,
      palette: palette as [number, number, number][] | null,
    })

    // Extract resulting palette for display
    if (palette) {
      lastPalette.value = palette
    } else if (colorCount.value < 256 || grayscale.value) {
      lastPalette.value = extractPalette(result, colorCount.value)
    } else {
      lastPalette.value = []
    }

    const blob = await canvasToBlob(result, exportFormat.value, exportQuality.value)
    if (processedUrl.value) URL.revokeObjectURL(processedUrl.value)
    processedBlob.value = blob
    processedUrl.value = URL.createObjectURL(blob)
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

/* ── Download ── */
async function downloadResult() {
  if (!processedBlob.value || !imageFile.value) return
  const ext = exportFormat.value.split('/')[1]
  downloadBlob(processedBlob.value, generateFilename(imageFile.value.name, 'pixelated', ext))
}
</script>

<style scoped>
.tool-page__sidebar-title {
  display: flex; align-items: center; gap: var(--space-xs);
  font-size: var(--text-md); font-weight: var(--weight-semibold); color: var(--color-ink);
  margin-bottom: var(--space-base);
}
/* Controls */
.control-group { display: flex; flex-direction: column; gap: var(--space-xs); }
.control-label { font-size: 9px; color: var(--color-muted); text-transform: uppercase; }
.control-row { display: flex; align-items: center; gap: var(--space-sm); }
.control-slider { flex: 1; accent-color: var(--color-primary); }
.control-value { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); min-width: 48px; text-align: right; }
.checkbox-label { display: flex; align-items: center; gap: var(--space-xs); font-size: var(--text-sm); color: var(--color-body); cursor: pointer; }

/* Format buttons */
.format-options { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.format-btn {
  padding: var(--space-xs) var(--space-base); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; font-size: 10px; color: var(--color-body); transition: all 0.15s ease;
}
.format-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }

/* Palette grid */
.palette-grid { display: flex; flex-direction: column; gap: 4px; }
.palette-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 8px; border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; transition: all 0.15s ease;
  width: 100%; text-align: left;
}
.palette-btn.active { border-color: var(--color-primary); background: var(--color-canvas-soft); }
.palette-btn__label { font-size: 10px; color: var(--color-body); min-width: 56px; }
.palette-btn.active .palette-btn__label { color: var(--color-primary); }
.palette-btn__swatches { display: flex; gap: 2px; }

/* Color swatch */
.swatch {
  display: inline-block; width: 14px; height: 14px; border-radius: 2px;
  border: 1px solid var(--color-hairline); flex-shrink: 0;
}
.swatch.sm { width: 10px; height: 10px; }
.swatch-more {
  font-size: 9px; color: var(--color-muted); line-height: 10px; margin-left: 2px;
}

/* Color count presets */
.preset-row { display: flex; gap: 3px; flex-wrap: wrap; margin-top: 4px; }
.preset-btn {
  padding: 2px 6px; border: 1px solid var(--color-hairline); border-radius: 3px;
  background: transparent; cursor: pointer; font-size: 9px; font-family: var(--font-mono);
  color: var(--color-body); transition: all 0.12s ease;
}
.preset-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }

/* Preview header */
.preview-header { display: flex; align-items: center; gap: 8px; }
.preview-palette { display: flex; align-items: center; gap: 2px; }

/* Result info */
.result-info { display: flex; flex-direction: column; gap: var(--space-xs); }
.result-row { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--color-body); }
</style>
