<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Files :size="16" />
          <px-text>批量处理</px-text>
        </div>

        <px-card>
          <template #header>上传多张图片</template>
          <div
            class="dropzone"
            :class="{ 'dropzone--active': isDragover, 'dropzone--has-files': files.length }"
            @click="triggerFileInput"
            @dragover.prevent="isDragover = true"
            @dragleave.prevent="isDragover = false"
            @drop.prevent="handleDrop"
          >
            <input ref="fileInputRef" type="file" multiple accept="image/*" class="dropzone__input" @change="onFilesChange" />
            <div class="dropzone__placeholder">
              <span class="dropzone__icon"><ImagePlus :size="32" :stroke-width="1.5" /></span>
              <span class="dropzone__text">拖放图片到此处或点击上传</span>
              <span class="dropzone__hint">支持 PNG / JPG / WebP / GIF / BMP，可多选</span>
            </div>
          </div>
          <div v-if="files.length" class="mt-base file-list">
            <div v-for="(f, i) in files" :key="i" class="file-item">
              <span class="file-name">{{ f.name }}</span>
              <span class="file-size">{{ formatSize(f.size) }}</span>
              <button class="file-remove" @click="removeFile(i)">✕</button>
            </div>
          </div>
        </px-card>

        <px-card v-if="files.length" class="mt-base">
          <template #header>选择操作</template>
          <PxSegmented v-model="operation" :options="[
            { value: 'pixelate', label: '像素化' },
            { value: 'grayscale', label: '灰度化' },
            { value: 'mosaic', label: '马赛克' },
          ]" />

          <div v-if="operation === 'pixelate' || operation === 'mosaic'" class="control-group mt-base">
            <label class="control-label"><px-text>方块大小</px-text></label>
            <div class="control-row">
              <PxSlider v-model="blockSize" :min="2" :max="50" :step="1" />
              <span class="control-value">{{ blockSize }}px</span>
            </div>
          </div>

          <div class="control-group mt-base">
            <label class="control-label"><px-text>输出格式</px-text></label>
            <PxSegmented v-model="outFormat" :options="[{ value: 'png', label: 'PNG' }, { value: 'webp', label: 'WebP' }, { value: 'jpeg', label: 'JPEG' }]" />
          </div>

          <div class="mt-base">
            <px-button type="primary" :disabled="batchRunning" @click="runBatch">
              {{ batchRunning ? `处理中 (${doneCount}/${files.length})` : `批量处理 (${files.length}张)` }}
            </px-button>
          </div>
        </px-card>

        <px-card v-if="results.length" class="mt-base">
          <template #header>处理结果 ({{ results.length }})</template>
          <div class="mt-base">
            <px-button type="primary" @click="downloadAll">全部下载</px-button>
          </div>
          <div class="mt-base file-list">
            <div
              v-for="(r, i) in results"
              :key="i"
              class="file-item file-item--clickable"
              :class="{ 'file-item--active': selectedIndex === i }"
              @click="selectedIndex = i"
            >
              <span class="file-name">{{ r.name }}</span>
              <a :href="r.url" :download="r.name" class="file-link" @click.stop>下载</a>
            </div>
          </div>
        </px-card>
      </div>

      <div class="tool-page__main">
        <div v-if="!files.length" class="tool-page__empty">
          <Files :size="48" :stroke-width="1" />
          <p>上传多张图片后在此批量处理</p>
        </div>
        <div v-else class="preview-area">
          <!-- Progress -->
          <div class="batch-progress" v-if="batchRunning">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <px-text>{{ doneCount }} / {{ files.length }}</px-text>
          </div>

          <!-- Before / After preview -->
          <div v-if="currentResult" class="preview-compare">
            <div class="preview-card">
              <div class="preview-card__header">处理前</div>
              <div class="preview-card__canvas">
                <CanvasPreview :src="currentOriginalUrl" :fill="true" />
              </div>
            </div>
            <div class="preview-card">
              <div class="preview-card__header">
                处理后
                <span class="preview-card__filename">{{ currentResult.name }}</span>
              </div>
              <div class="preview-card__canvas">
                <CanvasPreview :src="currentResult.url" :fill="true" />
              </div>
            </div>
          </div>

          <!-- No result yet hint -->
          <div v-else-if="!batchRunning" class="preview-card preview-card--hint">
            <div class="preview-card__canvas">
              <px-text>处理完成后可在此切换查看</px-text>
            </div>
          </div>

          <!-- Thumbnails strip -->
          <div v-if="results.length" class="thumb-strip">
            <button
              v-for="(r, i) in results"
              :key="i"
              class="thumb-item"
              :class="{ 'thumb-item--active': selectedIndex === i }"
              @click="selectedIndex = i"
            >
              <img :src="r.url" :alt="r.name" />
              <span class="thumb-label">{{ i + 1 }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Files, ImagePlus } from 'lucide-vue-next'
import { loadImageToCanvas, canvasToBlob, generateFilename } from '../../utils/canvas'
import { pixelate } from '../../utils/pixelate'
import { applyMosaic } from '../../utils/mosaic'
import CanvasPreview from '../common/CanvasPreview.vue'

interface BatchResult { name: string; url: string }
interface OriginalEntry { name: string; url: string }

const files = ref<File[]>([])
const operation = ref<'pixelate' | 'grayscale' | 'mosaic'>('pixelate')
const blockSize = ref(8)
const outFormat = ref('png')
const batchRunning = ref(false)
const doneCount = ref(0)
const results = ref<BatchResult[]>([])
const originals = ref<OriginalEntry[]>([])
const selectedIndex = ref(0)
const isDragover = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFilesChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    files.value = [...files.value, ...Array.from(input.files)]
  }
}

function handleDrop(e: DragEvent) {
  isDragover.value = false
  if (e.dataTransfer?.files) {
    files.value = [...files.value, ...Array.from(e.dataTransfer.files)]
  }
}

function removeFile(i: number) {
  files.value.splice(i, 1)
}

// Clamp selectedIndex when results change
watch(() => results.value.length, (len) => {
  if (selectedIndex.value >= len) selectedIndex.value = Math.max(0, len - 1)
})

const currentResult = computed(() => results.value[selectedIndex.value] ?? null)
const currentOriginalUrl = computed(() => originals.value[selectedIndex.value]?.url ?? '')

const progressPercent = computed(() =>
  files.value.length ? (doneCount.value / files.value.length) * 100 : 0
)

function applyOperation(canvas: HTMLCanvasElement): HTMLCanvasElement {
  switch (operation.value) {
    case 'pixelate':
      return pixelate(canvas, { pixelSize: blockSize.value })
    case 'mosaic':
      return applyMosaic(canvas, { blockSize: blockSize.value })
    case 'grayscale':
      return toGrayscale(canvas)
    default: return canvas
  }
}

function toGrayscale(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = canvas.width; c.height = canvas.height
  const ctx = c.getContext('2d')!
  ctx.drawImage(canvas, 0, 0)
  const img = ctx.getImageData(0, 0, c.width, c.height)
  for (let i = 0; i < img.data.length; i += 4) {
    const g = 0.299 * img.data[i] + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2]
    img.data[i] = img.data[i + 1] = img.data[i + 2] = g
  }
  ctx.putImageData(img, 0, 0)
  return c
}

async function runBatch() {
  batchRunning.value = true; doneCount.value = 0
  results.value.forEach(r => URL.revokeObjectURL(r.url))
  originals.value.forEach(o => URL.revokeObjectURL(o.url))
  results.value = []; originals.value = []
  selectedIndex.value = 0

  for (const file of files.value) {
    try {
      const src = await loadImageToCanvas(file)
      const out = applyOperation(src)
      const blob = await canvasToBlob(out, `image/${outFormat.value}`)
      const url = URL.createObjectURL(blob)
      const name = generateFilename(file.name, operation.value, outFormat.value)
      results.value.push({ name, url })
      originals.value.push({ name: file.name, url: URL.createObjectURL(file) })
    } catch (e) { console.error('Batch error:', e) }
    doneCount.value++
  }
  batchRunning.value = false
}

function downloadAll() {
  results.value.forEach(r => {
    const a = document.createElement('a')
    a.href = r.url; a.download = r.name; a.click()
  })
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

.format-btns { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.format-btn {
  padding: 4px 12px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm);
  background: transparent; color: var(--color-body); font-size: var(--text-sm); cursor: pointer;
}
.format-btn:hover { border-color: var(--color-primary); }
.format-btn.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

/* Dropzone — matches ImageUploader style */
.dropzone {
  background: var(--color-surface-card);
  border: 2px dashed var(--color-hairline-strong);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.dropzone:hover,
.dropzone--active {
  border-color: var(--color-primary);
  background: var(--color-canvas-soft);
}
.dropzone__input { display: none; }
.dropzone__placeholder {
  display: flex; flex-direction: column; align-items: center;
  gap: var(--space-xs); padding: var(--space-lg); text-align: center;
}
.dropzone__icon {
  color: var(--color-muted-soft);
  display: flex; align-items: center; justify-content: center;
}
.dropzone__text {
  font-family: var(--font-pixel);
  font-size: var(--text-xs);
  color: var(--color-ink);
}
.dropzone__hint {
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.file-list { max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
.file-item {
  display: flex; align-items: center; gap: var(--space-sm); padding: 4px 8px;
  background: var(--color-canvas-soft); border-radius: var(--radius-sm); font-size: var(--text-sm);
}
.file-item--clickable { cursor: pointer; transition: background 0.15s; }
.file-item--clickable:hover { background: var(--color-canvas-soft); filter: brightness(0.96); }
.file-item--active { outline: 2px solid var(--color-primary); outline-offset: -1px; }
.file-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-size { color: var(--color-muted); font-size: 9px; }
.file-remove { background: none; border: none; cursor: pointer; color: var(--color-muted); }
.file-link { color: var(--color-primary); text-decoration: none; }

.preview-area { display: flex; flex-direction: column; gap: var(--space-base); height: 100%; }
.batch-progress { display: flex; align-items: center; gap: var(--space-sm); flex-shrink: 0; }
.progress-bar { flex: 1; height: 6px; background: var(--color-hairline); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--color-primary); transition: width 0.2s; }

.preview-compare { display: flex; gap: var(--space-base); flex: 1; min-height: 0; }
.preview-card {
  display: flex; flex-direction: column; flex: 1; min-height: 0;
  background: var(--color-surface-card); border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg); overflow: hidden;
}
.preview-card--hint {
  flex: 1; justify-content: center; align-items: center;
}
.preview-card__header {
  padding: var(--space-sm) var(--space-base); border-bottom: 1px solid var(--color-hairline);
  font-size: var(--text-sm); color: var(--color-body);
  display: flex; align-items: center; justify-content: space-between;
}
.preview-card__filename {
  font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-muted);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 50%;
}
.preview-card__canvas {
  flex: 1; min-height: 0; display: flex; justify-content: center; align-items: center;
  overflow: auto; padding: var(--space-base);
}

/* Thumbnail strip */
.thumb-strip {
  display: flex; gap: 6px; overflow-x: auto; padding: var(--space-xs) 0; flex-shrink: 0;
}
.thumb-item {
  flex-shrink: 0; width: 64px; display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 4px; background: var(--color-canvas-soft); border: 2px solid transparent;
  border-radius: var(--radius-sm); cursor: pointer; transition: border-color 0.15s;
}
.thumb-item:hover { border-color: var(--color-primary); }
.thumb-item--active { border-color: var(--color-primary); background: var(--color-canvas-soft); }
.thumb-item img { width: 100%; height: 48px; object-fit: contain; image-rendering: pixelated; }
.thumb-label { font-size: 9px; color: var(--color-muted); }
</style>
