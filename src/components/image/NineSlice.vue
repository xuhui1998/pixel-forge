<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Grid2x2 :size="16" />
          <px-text>九宫格切图</px-text>
        </div>

        <px-card>
          <template #header>上传图片</template>
          <ImageUploader v-model="imageFile" />
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>切割线设置</template>
          <div class="control-group">
            <label class="control-label"><px-text>上边距 (Top)</px-text></label>
            <div class="control-row">
              <PxSlider v-model="config.top" :min="0" :max="maxEdge" :step="1" />
              <span class="control-value">{{ config.top }}px</span>
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>下边距 (Bottom)</px-text></label>
            <div class="control-row">
              <PxSlider v-model="config.bottom" :min="0" :max="maxEdge" :step="1" />
              <span class="control-value">{{ config.bottom }}px</span>
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>左边距 (Left)</px-text></label>
            <div class="control-row">
              <PxSlider v-model="config.left" :min="0" :max="maxEdge" :step="1" />
              <span class="control-value">{{ config.left }}px</span>
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>右边距 (Right)</px-text></label>
            <div class="control-row">
              <PxSlider v-model="config.right" :min="0" :max="maxEdge" :step="1" />
              <span class="control-value">{{ config.right }}px</span>
            </div>
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="processing" @click="processSlice">
              {{ processing ? '处理中...' : '执行切割' }}
            </px-button>
          </div>
        </px-card>

        <px-card v-if="sliceResult" class="mt-base">
          <template #header>拉伸预览尺寸</template>
          <div class="control-group">
            <label class="control-label"><px-text>目标宽度</px-text></label>
            <div class="control-row">
              <PxSlider v-model="previewW" :min="50" :max="2000" :step="10" />
              <span class="control-value">{{ previewW }}px</span>
            </div>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>目标高度</px-text></label>
            <div class="control-row">
              <PxSlider v-model="previewH" :min="50" :max="2000" :step="10" />
              <span class="control-value">{{ previewH }}px</span>
            </div>
          </div>
          <div class="mt-base">
            <px-button type="primary" @click="downloadPreview">下载拉伸预览</px-button>
          </div>
        </px-card>
      </div>

      <div class="tool-page__main">
        <div v-if="!imageFile" class="tool-page__empty">
          <Grid2x2 :size="48" :stroke-width="1" />
          <p>上传图片后在此预览</p>
        </div>
        <div v-else class="tool-page__compare" style="align-items: stretch;">
          <!-- 左侧：切割线预览 -->
          <div class="preview-card" style="flex: 1.2;">
            <div class="preview-card__header">切割线预览 <span v-if="imgNatW" class="slice-header-info">{{ imgNatW }} × {{ imgNatH }}</span></div>
            <div class="preview-card__canvas slice-preview-wrap" ref="sliceWrapRef">
              <img
                ref="sliceImgRef"
                :src="originalUrl"
                class="slice-preview-img pixel-render"
                @load="onSliceImgLoad"
              />
              <!-- SVG overlay: slice lines -->
              <svg v-if="imgNatW" class="slice-overlay-svg">
                <!-- Horizontal lines -->
                <line :x1="0" :y1="sliceLineTop" :x2="'100%'" :y2="sliceLineTop" stroke="var(--color-primary)" stroke-width="1.5" stroke-dasharray="6 3" />
                <line :x1="0" :y1="sliceLineBottom" :x2="'100%'" :y2="sliceLineBottom" stroke="var(--color-primary)" stroke-width="1.5" stroke-dasharray="6 3" />
                <!-- Vertical lines -->
                <line :x1="sliceLineLeft" :y1="0" :x2="sliceLineLeft" :y2="'100%'" stroke="var(--color-primary)" stroke-width="1.5" stroke-dasharray="6 3" />
                <line :x1="sliceLineRight" :y1="0" :x2="sliceLineRight" :y2="'100%'" stroke="var(--color-primary)" stroke-width="1.5" stroke-dasharray="6 3" />
                <!-- Dimension labels -->
                <text :x="(sliceLineLeft + sliceLineRight) / 2" :y="sliceLineTop - 4" text-anchor="middle"
                  fill="var(--color-primary)" font-size="10" font-family="monospace">{{ config.left }},{{ config.top }}</text>
                <text :x="(sliceLineLeft + sliceLineRight) / 2" :y="sliceLineBottom + 14" text-anchor="middle"
                  fill="var(--color-primary)" font-size="10" font-family="monospace">{{ imgNatW - config.right }},{{ imgNatH - config.bottom }}</text>
              </svg>
            </div>
          </div>

          <!-- 右侧 -->
          <div style="flex: 1; display: flex; flex-direction: column; gap: var(--space-base); min-height: 0;">
            <div v-if="sliceResult" class="preview-card" style="flex: 0 0 auto;">
              <div class="preview-card__header">9 区域</div>
              <div class="preview-card__canvas">
                <div class="nine-grid">
                  <div
                    v-for="name in regionNames" :key="name"
                    class="nine-grid__cell"
                    :class="{ active: selectedRegion === name }"
                    @click="selectRegion(name)"
                  >
                    <canvas ref="sliceCanvases" :data-name="name" />
                    <span class="nine-grid__label">{{ name }}</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- 区域大图预览 -->
            <div v-if="sliceResult && selectedRegion" class="preview-card" style="flex: 1; min-height: 0;">
              <div class="preview-card__header">
                <span>{{ selectedRegion }} 区域预览</span>
                <span class="slice-header-info" v-if="selectedSliceSize">{{ selectedSliceSize }}</span>
              </div>
              <div class="preview-card__canvas">
                <img :src="selectedSliceUrl" class="slice-detail-img pixel-render" />
              </div>
            </div>
            <div v-if="stretchUrl" class="preview-card" style="flex: 1; min-height: 0;">
              <div class="preview-card__header">拉伸预览 ({{ previewW }}×{{ previewH }})</div>
              <div class="preview-card__canvas">
                <CanvasPreview :src="stretchUrl" :fill="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { Grid2x2 } from 'lucide-vue-next'
import { loadImageToCanvas, canvasToBlob, downloadBlob, generateFilename } from '../../utils/canvas'
import { nineSlice, drawNineSlice, REGION_NAMES_LIST, type NineSliceConfig, type NineSliceResult } from '../../utils/nine-slice'
import ImageUploader from '../common/ImageUploader.vue'
import CanvasPreview from '../common/CanvasPreview.vue'

const imageFile = ref<File | null>(null)
const originalUrl = ref('')
const processing = ref(false)
const sliceResult = ref<NineSliceResult | null>(null)
const stretchUrl = ref('')
const previewW = ref(400)
const previewH = ref(200)

const config = reactive<NineSliceConfig>({ top: 8, bottom: 8, left: 8, right: 8 })
const regionNames = REGION_NAMES_LIST

/* Region selection & detail preview */
const selectedRegion = ref<string>('')
const sliceDataUrls = ref<Record<string, string>>({})

const selectedSliceUrl = computed(() => {
  if (!selectedRegion.value) return ''
  return sliceDataUrls.value[selectedRegion.value] || ''
})

const selectedSliceSize = computed(() => {
  if (!selectedRegion.value || !sliceResult.value) return ''
  const c = sliceResult.value.slices[selectedRegion.value]
  if (!c) return ''
  return `${c.width} × ${c.height}`
})

function selectRegion(name: string) {
  selectedRegion.value = selectedRegion.value === name ? '' : name
}

/* Slice line overlay */
const sliceWrapRef = ref<HTMLDivElement | null>(null)
const sliceImgRef = ref<HTMLImageElement | null>(null)
const imgNatW = ref(0)
const imgNatH = ref(0)
const imgDispW = ref(0)
const imgDispH = ref(0)
const imgOffsetX = ref(0)
const imgOffsetY = ref(0)

function updateSliceDisplaySize() {
  const img = sliceImgRef.value
  const wrap = sliceWrapRef.value
  if (!img || !wrap) return
  const wrapRect = wrap.getBoundingClientRect()
  const wrapW = wrapRect.width
  const wrapH = wrapRect.height
  const natW = imgNatW.value
  const natH = imgNatH.value
  const scale = Math.min(wrapW / natW, wrapH / natH, 1)
  imgDispW.value = natW * scale
  imgDispH.value = natH * scale
  imgOffsetX.value = (wrapW - imgDispW.value) / 2
  imgOffsetY.value = (wrapH - imgDispH.value) / 2
}

function onSliceImgLoad() {
  const img = sliceImgRef.value
  if (!img) return
  imgNatW.value = img.naturalWidth
  imgNatH.value = img.naturalHeight
  updateSliceDisplaySize()
}

const sliceScale = computed(() => {
  if (!imgDispW.value || !imgNatW.value) return 1
  return imgDispW.value / imgNatW.value
})

const sliceLineTop = computed(() => imgOffsetY.value + config.top * sliceScale.value)
const sliceLineBottom = computed(() => imgOffsetY.value + (imgNatH.value - config.bottom) * sliceScale.value)
const sliceLineLeft = computed(() => imgOffsetX.value + config.left * sliceScale.value)
const sliceLineRight = computed(() => imgOffsetX.value + (imgNatW.value - config.right) * sliceScale.value)

const maxEdge = computed(() => {
  return Math.max(imgNatW.value, imgNatH.value, 200)
})

watch(imageFile, (f) => {
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
  if (stretchUrl.value) URL.revokeObjectURL(stretchUrl.value)
  originalUrl.value = ''; stretchUrl.value = ''; sliceResult.value = null; selectedRegion.value = ''
  if (f) {
    originalUrl.value = URL.createObjectURL(f)
    loadImageToCanvas(f).then(c => {
      config.top = Math.min(config.top, c.height)
      config.bottom = Math.min(config.bottom, c.height)
      config.left = Math.min(config.left, c.width)
      config.right = Math.min(config.right, c.width)
    })
  }
})

async function processSlice() {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    sliceResult.value = nineSlice(canvas, { ...config })
    if (stretchUrl.value) URL.revokeObjectURL(stretchUrl.value)
    const stretched = drawNineSlice(sliceResult.value, previewW.value, previewH.value)
    const blob = await canvasToBlob(stretched, 'image/png')
    stretchUrl.value = URL.createObjectURL(blob)

    await nextTick()
    renderSlices()
  } catch (e) { console.error(e) } finally { processing.value = false }
}

function renderSlices() {
  if (!sliceResult.value) return
  // Clean up old data URLs
  Object.values(sliceDataUrls.value).forEach(u => URL.revokeObjectURL(u))
  sliceDataUrls.value = {}
  // Render each slice into its canvas element and generate data URLs
  const canvases = document.querySelectorAll('[data-name]')
  canvases.forEach(el => {
    const name = (el as HTMLElement).dataset.name!
    const sliceCanvas = sliceResult.value!.slices[name]
    if (sliceCanvas) {
      const c = el as HTMLCanvasElement
      c.width = sliceCanvas.width
      c.height = sliceCanvas.height
      c.getContext('2d')!.drawImage(sliceCanvas, 0, 0)
      // Generate data URL for detail preview
      sliceDataUrls.value[name] = sliceCanvas.toDataURL('image/png')
    }
  })
  // Auto-select first region if none selected
  if (!selectedRegion.value && regionNames.length) {
    selectedRegion.value = regionNames[0]
  }
}

async function downloadPreview() {
  if (!sliceResult.value || !imageFile.value) return
  const stretched = drawNineSlice(sliceResult.value, previewW.value, previewH.value)
  const blob = await canvasToBlob(stretched, 'image/png')
  downloadBlob(blob, generateFilename(imageFile.value.name, '9slice', 'png'))
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

.preview-area { display: flex; flex-direction: column; gap: var(--space-base); height: 100%; }
.preview-card {
  display: flex; flex-direction: column; flex: 1; min-height: 0;
  background: var(--color-surface-card); border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg); overflow: hidden;
}
.preview-card__header {
  padding: var(--space-sm) var(--space-base); border-bottom: 1px solid var(--color-hairline);
  font-size: var(--text-sm); color: var(--color-body);
}
.preview-card__canvas {
  flex: 1; min-height: 0; display: flex; justify-content: center; align-items: center;
  overflow: auto; padding: var(--space-base);
}

/* Slice line overlay */
.slice-preview-wrap {
  position: relative;
  background: repeating-conic-gradient(var(--color-canvas-soft) 0% 25%, var(--color-canvas) 0% 50%) 0 0 / 16px 16px;
}
.slice-preview-img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none;
}
.slice-overlay-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.slice-header-info {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-muted);
  margin-left: 8px;
}

.nine-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
  background: var(--color-hairline); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  overflow: hidden; max-width: 400px; width: 100%;
}
.nine-grid__cell {
  background: var(--color-canvas-soft); display: flex; flex-direction: column;
  align-items: center; justify-content: center; padding: 4px; gap: 2px;
  min-height: 60px; cursor: pointer; transition: all 0.15s ease;
  border: 2px solid transparent;
}
.nine-grid__cell:hover {
  background: color-mix(in srgb, var(--color-primary) 8%, var(--color-canvas-soft));
}
.nine-grid__cell.active {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 12%, var(--color-canvas-soft));
}
.nine-grid__cell canvas {
  image-rendering: pixelated; max-width: 100%; max-height: 60px;
  border: 1px solid var(--color-hairline); border-radius: 2px;
}
.nine-grid__label { font-size: 7px; color: var(--color-muted); }
.nine-grid__cell.active .nine-grid__label { color: var(--color-primary); font-weight: var(--weight-medium); }

/* Slice detail preview */
.slice-detail-img {
  image-rendering: pixelated;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sm);
}
</style>
