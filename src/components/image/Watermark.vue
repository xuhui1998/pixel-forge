<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Type :size="16" />
          <px-text>水印添加</px-text>
        </div>

        <px-card>
          <template #header>上传图片</template>
          <ImageUploader v-model="imageFile" />
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>水印文字</template>
          <div class="control-group">
            <px-input v-model="options.text" placeholder="请输入水印文字" />
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>字体</px-text></label>
            <PxSegmented v-model="options.fontFamily" :options="fonts" />
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>字号</px-text></label>
            <div class="control-row">
              <PxSlider v-model="options.fontSize" :min="8" :max="200" :step="1" />
              <span class="control-value">{{ options.fontSize }}px</span>
            </div>
          </div>
          <div class="control-row mt-base">
            <div class="control-group" style="flex:1">
              <label class="control-label"><px-text>颜色</px-text></label>
              <PxColorPicker v-model="options.color" show-hex />
            </div>
            <div class="control-group" style="flex:1">
              <label class="control-label"><px-text>透明度</px-text></label>
              <div class="control-row">
                <PxSlider v-model="options.opacity" :min="0.05" :max="1" :step="0.05" />
                <span class="control-value">{{ Math.round(options.opacity * 100) }}%</span>
              </div>
            </div>
          </div>
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>位置与样式</template>
          <div class="control-group">
            <label class="control-label"><px-text>位置</px-text></label>
            <PxSegmented v-model="options.position" :options="positions" />
          </div>
          <template v-if="options.position === 'custom'">
            <div class="control-group mt-base">
              <label class="control-label"><px-text>X 偏移</px-text></label>
              <div class="control-row">
                <PxSlider v-model="options.offsetX" :min="0" :max="imgSize.w" :step="1" />
                <span class="control-value">{{ options.offsetX }}</span>
              </div>
            </div>
            <div class="control-group mt-base">
              <label class="control-label"><px-text>Y 偏移</px-text></label>
              <div class="control-row">
                <PxSlider v-model="options.offsetY" :min="0" :max="imgSize.h" :step="1" />
                <span class="control-value">{{ options.offsetY }}</span>
              </div>
            </div>
          </template>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>旋转角度</px-text></label>
            <div class="control-row">
              <PxSlider v-model="options.rotation" :min="-180" :max="180" :step="1" />
              <span class="control-value">{{ options.rotation }}°</span>
            </div>
          </div>
          <div class="control-row mt-base">
            <PxSwitch v-model="options.bold" label="加粗" />
            <PxSwitch v-model="options.stroke" label="描边" />
            <PxSwitch v-model="options.tile" label="平铺" />
          </div>
          <template v-if="options.tile">
            <div class="control-group mt-base">
              <label class="control-label"><px-text>平铺间距 X</px-text></label>
              <div class="control-row">
                <PxSlider v-model="options.tileGapX" :min="20" :max="500" :step="5" />
                <span class="control-value">{{ options.tileGapX }}px</span>
              </div>
            </div>
            <div class="control-group mt-base">
              <label class="control-label"><px-text>平铺间距 Y</px-text></label>
              <div class="control-row">
                <PxSlider v-model="options.tileGapY" :min="20" :max="500" :step="5" />
                <span class="control-value">{{ options.tileGapY }}px</span>
              </div>
            </div>
          </template>
          <template v-if="options.stroke">
            <div class="control-group mt-base">
              <label class="control-label"><px-text>描边颜色</px-text></label>
              <PxColorPicker v-model="options.strokeColor" show-hex />
            </div>
          </template>
          <div class="mt-base">
            <px-button type="primary" :disabled="processing" @click="processImage">
              {{ processing ? '处理中...' : '应用水印' }}
            </px-button>
          </div>
        </px-card>

        <px-card v-if="resultUrl" class="mt-base">
          <template #header>导出</template>
          <div class="control-group">
            <label class="control-label"><px-text>格式</px-text></label>
            <PxSegmented v-model="format" :options="[{ value: 'png', label: 'PNG' }, { value: 'webp', label: 'WebP' }, { value: 'jpeg', label: 'JPEG' }]" />
          </div>
          <div class="mt-base">
            <px-button type="primary" @click="downloadResult">下载图片</px-button>
          </div>
        </px-card>
      </div>

      <div class="tool-page__main">
        <div v-if="!imageFile" class="tool-page__empty">
          <Type :size="48" :stroke-width="1" />
          <p>上传图片后在此预览</p>
        </div>
        <div v-else class="compare">
          <CanvasPreview :src="originalUrl" label="原图" :fill="true" />
          <CanvasPreview v-if="resultUrl" :src="resultUrl" label="水印" :fill="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Type } from 'lucide-vue-next'
import { loadImageToCanvas, canvasToBlob, downloadBlob, generateFilename } from '../../utils/canvas'
import { addTextWatermark, WATERMARK_POSITIONS, WATERMARK_FONTS, type TextWatermarkOptions } from '../../utils/watermark'
import ImageUploader from '../common/ImageUploader.vue'
import CanvasPreview from '../common/CanvasPreview.vue'

const imageFile = ref<File | null>(null)
const originalUrl = ref('')
const resultUrl = ref('')
const processing = ref(false)
const format = ref('png')
const imgSize = reactive({ w: 800, h: 600 })
const positions = WATERMARK_POSITIONS
const fonts = WATERMARK_FONTS

const options = reactive<TextWatermarkOptions>({
  text: 'PixelForge',
  fontSize: 36,
  color: '#ffffff',
  opacity: 0.3,
  rotation: -30,
  position: 'center',
  offsetX: 100,
  offsetY: 100,
  tile: true,
  tileGapX: 120,
  tileGapY: 80,
  fontFamily: 'sans-serif',
  bold: false,
  stroke: false,
  strokeColor: '#000000',
})

watch(imageFile, (f) => {
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  originalUrl.value = ''; resultUrl.value = ''
  if (f) {
    originalUrl.value = URL.createObjectURL(f)
    loadImageToCanvas(f).then(c => {
      imgSize.w = c.width; imgSize.h = c.height
      options.fontSize = Math.max(12, Math.round(Math.min(c.width, c.height) / 20))
      options.offsetX = Math.round(c.width * 0.5)
      options.offsetY = Math.round(c.height * 0.5)
    })
  }
})

async function processImage() {
  if (!imageFile.value) return
  processing.value = true
  try {
    const canvas = await loadImageToCanvas(imageFile.value)
    const result = addTextWatermark(canvas, { ...options })
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    const blob = await canvasToBlob(result, `image/${format.value}`)
    resultUrl.value = URL.createObjectURL(blob)
  } catch (e) { console.error(e) } finally { processing.value = false }
}

async function downloadResult() {
  if (!resultUrl.value || !imageFile.value) return
  const resp = await fetch(resultUrl.value)
  const blob = await resp.blob()
  downloadBlob(blob, generateFilename(imageFile.value.name, 'watermark', format.value))
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

.text-input {
  width: 100%; padding: 6px 10px; font-size: var(--text-sm);
  background: var(--color-canvas-soft); border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sm); color: var(--color-ink); outline: none;
  transition: border-color 0.15s;
}
.text-input:focus { border-color: var(--color-primary); }
.text-input::placeholder { color: var(--color-muted); }

.format-btns { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.format-btn {
  padding: 4px 12px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm);
  background: transparent; color: var(--color-body); font-size: var(--text-sm); cursor: pointer;
}
.format-btn:hover { border-color: var(--color-primary); }
.format-btn.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

.pos-grid { display: flex; gap: var(--space-xs); flex-wrap: wrap; }

.color-row { display: flex; align-items: center; gap: var(--space-sm); }
.color-picker {
  width: 32px; height: 28px; padding: 0; border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sm); cursor: pointer; background: none;
}
.color-picker::-webkit-color-swatch-wrapper { padding: 2px; }
.color-picker::-webkit-color-swatch { border: none; border-radius: 2px; }

.toggle-label {
  display: flex; align-items: center; gap: 6px; font-size: var(--text-sm);
  color: var(--color-body); cursor: pointer; user-select: none;
}
.toggle-check { accent-color: var(--color-primary); }

.compare { display: flex; gap: var(--space-base); height: 100%; width: 100%; align-items: center; justify-content: center; }
</style>
