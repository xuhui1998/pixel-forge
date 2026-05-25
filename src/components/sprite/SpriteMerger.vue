<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <!-- Left: Controls -->
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Link2 :size="16" />
          <px-text>精灵图合并</px-text>
        </div>

        <px-card>
          <template #header>上传图片 (可多选)</template>
          <div class="uploader-area" @dragover.prevent @drop.prevent="onDrop">
            <input type="file" multiple accept="image/*" @change="onFilesSelected" ref="fileInput" class="hidden-input" />
            <div class="upload-prompt" @click="($refs.fileInput as HTMLInputElement).click()">
              <span class="upload-icon">📁</span>
              <px-text>点击或拖拽上传多张图片</px-text>
            </div>
          </div>
        </px-card>

        <px-card v-if="files.length" class="mt-base">
          <template #header><span>已选文件 ({{ files.length }})</span></template>
          <div class="file-list">
            <div v-for="(f, i) in files" :key="i" class="file-item">
              <img :src="previews[i]" class="file-thumb" />
              <span class="file-name">{{ f.name }}</span>
              <button class="file-remove" @click="removeFile(i)">✕</button>
            </div>
          </div>
        </px-card>

        <px-card v-if="files.length" class="mt-base">
          <template #header>合并参数</template>
          <div class="control-group">
            <label class="control-label"><px-text>排列方式</px-text></label>
            <PxSegmented v-model="layout" :options="layoutOptions" />
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>列数 (仅网格模式)</px-text></label>
            <PxNumberInput v-model="cols" :min="1" />
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>间距 (px)</px-text></label>
            <PxNumberInput v-model="gap" :min="0" />
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="!files.length || processing" @click="processMerge">
              {{ processing ? '合并中...' : '合并精灵图' }}
            </px-button>
          </div>
        </px-card>

        <px-card v-if="resultUrl" class="mt-base">
          <template #header>导出</template>
          <px-button type="primary" @click="downloadResult"><Download :size="14" /> 下载精灵图</px-button>
        </px-card>
      </div>

      <!-- Right: Preview -->
      <div class="tool-page__main">
        <div v-if="!resultUrl" class="tool-page__empty">
          <Link2 :size="48" :stroke-width="1" />
          <p>上传多张图片合并为精灵图</p>
        </div>

        <div v-else class="preview-area">
          <div class="preview-card">
            <div class="preview-card__header">合并结果</div>
            <div class="preview-card__canvas checkerboard">
              <img :src="resultUrl" class="preview-img" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Link2, Download } from 'lucide-vue-next'
import { downloadBlob } from '../../utils/canvas'

const files = ref<File[]>([])
const previews = ref<string[]>([])
const layout = ref<'grid' | 'horizontal' | 'vertical'>('grid')
const layoutOptions = [
  { label: '网格', value: 'grid' },
  { label: '水平', value: 'horizontal' },
  { label: '垂直', value: 'vertical' },
]
const cols = ref(4)
const gap = ref(0)
const processing = ref(false)
const resultBlob = ref<Blob | null>(null)
const resultUrl = ref('')

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  addFiles(Array.from(input.files || []))
}
function onDrop(e: DragEvent) {
  addFiles(Array.from(e.dataTransfer?.files || []))
}
function addFiles(newFiles: File[]) {
  const imageFiles = newFiles.filter(f => f.type.startsWith('image/'))
  files.value.push(...imageFiles)
  previews.value = files.value.map(f => URL.createObjectURL(f))
}
function removeFile(i: number) {
  files.value.splice(i, 1)
  URL.revokeObjectURL(previews.value[i])
  previews.value.splice(i, 1)
}

async function processMerge() {
  if (!files.value.length) return
  processing.value = true
  try {
    const images = await Promise.all(files.value.map(async (f) => {
      const img = new Image()
      img.src = URL.createObjectURL(f)
      await new Promise(r => { img.onload = r })
      return img
    }))
    let maxW = 0, maxH = 0
    images.forEach(img => { maxW = Math.max(maxW, img.width); maxH = Math.max(maxH, img.height) })
    const g = gap.value
    let canvasW: number, canvasH: number
    const count = images.length
    if (layout.value === 'horizontal') {
      canvasW = images.reduce((s, img) => s + img.width, 0) + g * (count - 1)
      canvasH = maxH
    } else if (layout.value === 'vertical') {
      canvasW = maxW
      canvasH = images.reduce((s, img) => s + img.height, 0) + g * (count - 1)
    } else {
      const c = cols.value
      const r = Math.ceil(count / c)
      canvasW = c * maxW + g * (c - 1)
      canvasH = r * maxH + g * (r - 1)
    }
    const canvas = document.createElement('canvas')
    canvas.width = canvasW; canvas.height = canvasH
    const ctx = canvas.getContext('2d')!
    images.forEach((img, i) => {
      let x: number, y: number
      if (layout.value === 'horizontal') {
        x = images.slice(0, i).reduce((s, im) => s + im.width, 0) + g * i
        y = Math.round((maxH - img.height) / 2)
      } else if (layout.value === 'vertical') {
        x = Math.round((maxW - img.width) / 2)
        y = images.slice(0, i).reduce((s, im) => s + im.height, 0) + g * i
      } else {
        const c = cols.value
        const col = i % c, row = Math.floor(i / c)
        x = col * (maxW + g) + Math.round((maxW - img.width) / 2)
        y = row * (maxH + g) + Math.round((maxH - img.height) / 2)
      }
      ctx.drawImage(img, x, y)
    })
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'))
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultBlob.value = blob
    resultUrl.value = URL.createObjectURL(blob)
    images.forEach(img => URL.revokeObjectURL(img.src))
  } finally { processing.value = false }
}

function downloadResult() {
  if (!resultBlob.value) return
  downloadBlob(resultBlob.value, 'spritesheet.png')
}
</script>

<style scoped>
.tool-page__sidebar-title {
  display: flex; align-items: center; gap: var(--space-xs);
  font-size: var(--text-lg); font-weight: var(--weight-semibold); color: var(--color-ink);
  margin-bottom: var(--space-base);
}

.uploader-area { border: 2px dashed var(--color-hairline); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
.hidden-input { display: none; }
.upload-prompt { cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: var(--space-xs); color: var(--color-muted); }
.upload-icon { font-size: 2rem; }
.file-list { display: flex; flex-direction: column; gap: var(--space-xs); max-height: 200px; overflow-y: auto; }
.file-item { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-xs); border: 1px solid var(--color-hairline); border-radius: var(--radius-md); }
.file-thumb { width: 32px; height: 32px; object-fit: contain; image-rendering: pixelated; }
.file-name { flex: 1; font-size: var(--text-sm); color: var(--color-body); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-remove { border: none; background: none; color: var(--color-muted); cursor: pointer; font-size: var(--text-sm); }
.control-group { display: flex; flex-direction: column; gap: var(--space-xs); }
.control-label { font-size: 9px; color: var(--color-muted); text-transform: uppercase; }
.control-input {
  padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); width: 100%;
}
.format-options { display: flex; gap: var(--space-xs); }
.format-btn {
  padding: var(--space-xs) var(--space-base); border: 1px solid var(--color-hairline); border-radius: var(--radius-md);
  background: var(--color-surface-card); cursor: pointer; font-family: var(--font-pixel); font-size: 9px; color: var(--color-body); transition: all 0.15s ease;
}
.format-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }

/* Preview Area */
.preview-area { display: flex; flex-direction: column; height: 100%; }
.preview-card {
  display: flex; flex-direction: column;
  flex: 1; min-height: 0;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.preview-card__header {
  padding: var(--space-sm) var(--space-base);
  border-bottom: 1px solid var(--color-hairline);
  font-size: var(--text-sm); color: var(--color-body);
}
.preview-card__canvas {
  flex: 1; min-height: 0;
  display: flex; justify-content: center; align-items: center;
  overflow: auto; padding: var(--space-base);
}
.preview-card__canvas.checkerboard {
  background-image: linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
  background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0;
}
.preview-img { max-width: 100%; max-height: 100%; image-rendering: pixelated; }
</style>
