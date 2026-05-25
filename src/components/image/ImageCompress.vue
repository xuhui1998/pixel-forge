<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <!-- Left: Controls -->
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Download :size="16" />
          <px-text>图片压缩</px-text>
        </div>

        <px-card>
          <template #header>
            <span>上传图片</span>
            <span class="card-header-hint">（支持多选）</span>
          </template>
          <div
            class="batch-uploader"
            :class="{ 'batch-uploader--dragover': isDragover }"
            @click="triggerInput"
            @dragover.prevent="isDragover = true"
            @dragleave.prevent="isDragover = false"
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
              multiple
              class="sr-only"
              @change="handleInput"
            />
            <ImagePlus :size="28" :stroke-width="1.5" class="batch-uploader__icon" />
            <span class="batch-uploader__text">拖放或点击上传多张图片</span>
            <span class="batch-uploader__hint">PNG / JPG / WebP / GIF / BMP</span>
          </div>
        </px-card>

        <px-card v-if="queue.length" class="mt-base">
          <template #header>压缩设置</template>
          <div class="control-group">
            <label class="control-label"><px-text>压缩模式</px-text></label>
            <PxSegmented v-model="compressMode" :options="modes" />
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>输出质量</px-text></label>
            <div class="control-row">
              <PxSlider v-model="quality" :min="0.1" :max="1" :step="0.05" />
              <span class="control-value">{{ Math.round(quality * 100) }}%</span>
            </div>
          </div>
          <div class="mt-base button-row">
            <px-button type="primary" :disabled="processing" @click="compressAll">
              {{ processing ? `压缩中 (${progress})...` : '全部压缩' }}
            </px-button>
            <px-button plain :disabled="processing" @click="clearQueue">
              清空队列
            </px-button>
          </div>
        </px-card>
      </div>

      <!-- Right: Queue + Stats -->
      <div class="tool-page__main" style="gap: var(--space-base);">
        <!-- Stats -->
        <div v-if="queue.length && hasCompressed" class="stats-bar">
          <div class="stats-item">
            <span class="stats-label">图片数量</span>
            <span class="stats-value">{{ queue.length }} 张</span>
          </div>
          <div class="stats-divider" />
          <div class="stats-item">
            <span class="stats-label">原始总大小</span>
            <span class="stats-value">{{ formatFileSize(totalOriginal) }}</span>
          </div>
          <div class="stats-item stats-arrow">
            <ChevronRight :size="16" />
          </div>
          <div class="stats-item">
            <span class="stats-label">压缩后</span>
            <span class="stats-value stats-value--primary">{{ formatFileSize(totalCompressed) }}</span>
          </div>
          <div class="stats-divider" />
          <div class="stats-item">
            <span class="stats-label">总计节省</span>
            <span class="stats-value stats-value--success">{{ totalRatio }}</span>
          </div>
        </div>

        <px-card v-if="queue.length" style="flex:1; min-height:0; display:flex; flex-direction:column;">
          <template #header>
            <span>文件队列 ({{ queue.length }})</span>
          </template>
          <div class="queue-list" style="flex:1; overflow-y:auto;">
            <div
              v-for="(item, idx) in queue"
              :key="item.id"
              class="queue-item"
              :class="{ 'queue-item--done': item.status === 'done', 'queue-item--error': item.status === 'error', 'queue-item--processing': item.status === 'processing' }"
            >
              <img :src="item.thumb" class="queue-item__thumb pixel-render" />
              <div class="queue-item__info">
                <span class="queue-item__name" :title="item.file.name">{{ item.file.name }}</span>
                <div class="queue-item__meta">
                  <span>{{ formatFileSize(item.file.size) }}</span>
                  <template v-if="item.status === 'done'">
                    <ChevronRight :size="12" />
                    <span class="queue-item__compressed">{{ formatFileSize(item.compressedSize) }}</span>
                    <span class="queue-item__ratio">-{{ ((1 - item.compressedSize / item.file.size) * 100).toFixed(1) }}%</span>
                  </template>
                  <span v-else-if="item.status === 'error'" class="queue-item__error">失败</span>
                  <span v-else-if="item.status === 'processing'" class="queue-item__processing">压缩中…</span>
                </div>
              </div>
              <button class="queue-item__remove" @click="removeItem(idx)">✕</button>
            </div>
          </div>
        </px-card>

        <px-card v-if="hasCompressed">
          <template #header>导出设置</template>
          <div class="control-group">
            <label class="control-label"><px-text>输出格式</px-text></label>
            <div class="format-options">
              <button
                v-for="fmt in formats"
                :key="fmt.value"
                class="format-btn"
                :class="{ active: exportFormat === fmt.value }"
                @click="exportFormat = fmt.value"
              >
                {{ fmt.label }}
              </button>
            </div>
          </div>
          <div class="mt-base button-row">
            <px-button type="primary" @click="downloadAll">
              <Download :size="14" /> 全部下载
            </px-button>
          </div>
        </px-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, ImagePlus, ChevronRight } from 'lucide-vue-next'
import { compressImage } from '../../utils/compress'
import { formatFileSize, generateFilename, downloadBlob } from '../../utils/canvas'

/* ── Types ── */
type ItemStatus = 'pending' | 'processing' | 'done' | 'error'

interface QueueItem {
  id: number
  file: File
  thumb: string
  status: ItemStatus
  blob: Blob | null
  compressedSize: number
}

/* ── State ── */
const fileInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const queue = ref<QueueItem[]>([])
let nextId = 0

const compressMode = ref<'light' | 'standard' | 'extreme'>('standard')
const quality = ref(0.7)
const exportFormat = ref<'image/png' | 'image/jpeg' | 'image/webp'>('image/webp')
const processing = ref(false)
const progress = ref('')

const modes = [
  { value: 'light' as const, label: '轻量' },
  { value: 'standard' as const, label: '标准' },
  { value: 'extreme' as const, label: '极限' },
]

const formats = [
  { value: 'image/png' as const, label: 'PNG' },
  { value: 'image/jpeg' as const, label: 'JPEG' },
  { value: 'image/webp' as const, label: 'WebP' },
]

/* ── Computed ── */
const hasCompressed = computed(() => queue.value.some(i => i.status === 'done'))
const totalOriginal = computed(() => queue.value.reduce((s, i) => s + i.file.size, 0))
const totalCompressed = computed(() => queue.value.filter(i => i.status === 'done').reduce((s, i) => s + i.compressedSize, 0))
const totalRatio = computed(() => {
  const orig = totalOriginal.value
  if (!orig) return '0%'
  return `-${((1 - totalCompressed.value / orig) * 100).toFixed(1)}%`
})

/* ── Mode → quality mapping ── */
function getQualityForMode() {
  switch (compressMode.value) {
    case 'light': return Math.min(quality.value + 0.2, 1)
    case 'standard': return quality.value
    case 'extreme': return Math.max(quality.value - 0.2, 0.1)
  }
}

/* ── File handling ── */
function triggerInput() { fileInput.value?.click() }

function handleInput(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) addFiles(files)
  if (fileInput.value) fileInput.value.value = ''
}

function handleDrop(e: DragEvent) {
  isDragover.value = false
  const files = e.dataTransfer?.files
  if (files) addFiles(files)
}

function addFiles(files: FileList) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file.type.startsWith('image/')) continue
    queue.value.push({
      id: nextId++,
      file,
      thumb: URL.createObjectURL(file),
      status: 'pending',
      blob: null,
      compressedSize: 0,
    })
  }
}

function removeItem(idx: number) {
  const item = queue.value[idx]
  if (item.thumb) URL.revokeObjectURL(item.thumb)
  queue.value.splice(idx, 1)
}

function clearQueue() {
  queue.value.forEach(item => { if (item.thumb) URL.revokeObjectURL(item.thumb) })
  queue.value = []
}

/* ── Compress ── */
async function compressAll() {
  const pending = queue.value.filter(i => i.status !== 'done')
  if (!pending.length) return
  processing.value = true
  const q = getQualityForMode()
  let done = 0
  const total = pending.length

  for (const item of pending) {
    item.status = 'processing'
    progress.value = `${done}/${total}`
    try {
      const result = await compressImage(item.file, {
        maxSizeMB: 10,
        maxWidthOrHeight: compressMode.value === 'extreme' ? 1280 : 1920,
        quality: q,
        fileType: exportFormat.value,
      })
      item.blob = result
      item.compressedSize = result.size
      item.status = 'done'
    } catch {
      item.status = 'error'
    }
    done++
    progress.value = `${done}/${total}`
  }
  processing.value = false
}

/* ── Download ── */
function downloadAll() {
  const doneItems = queue.value.filter(i => i.status === 'done' && i.blob)
  doneItems.forEach(item => {
    downloadBlob(item.blob!, generateFilename(item.file.name, 'compressed'))
  })
}
</script>

<style scoped>
.tool-page__sidebar-title {
  display: flex; align-items: center; gap: var(--space-xs);
  font-size: var(--text-lg); font-weight: var(--weight-semibold); color: var(--color-ink);
  margin-bottom: var(--space-base);
}

.card-header-hint { font-size: var(--text-sm); color: var(--color-muted); margin-left: 4px; }

/* ── Stats Bar ── */
.stats-bar {
  display: flex;
  align-items: center;
  gap: var(--space-base);
  padding: var(--space-base) var(--space-lg);
  margin-bottom: var(--space-lg);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
}
.stats-item { display: flex; flex-direction: column; gap: 2px; }
.stats-label { font-size: 10px; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.stats-value { font-size: var(--text-lg); font-weight: var(--weight-bold); color: var(--color-ink); }
.stats-value--primary { color: var(--color-primary); }
.stats-value--success { color: #1f8a65; }
.stats-divider { width: 1px; height: 32px; background: var(--color-hairline); }
.stats-arrow { color: var(--color-muted); justify-content: center; }

/* ── Batch Uploader ── */
.batch-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-xl) var(--space-base);
  border: 2px dashed var(--color-hairline-strong);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 140px;
}
.batch-uploader:hover,
.batch-uploader--dragover {
  border-color: var(--color-primary);
  background: var(--color-canvas-soft);
}
.batch-uploader__icon { color: var(--color-muted-soft); }
.batch-uploader__text { font-size: var(--text-sm); color: var(--color-ink); }
.batch-uploader__hint { font-size: var(--text-xs); color: var(--color-muted); }

/* ── Controls ── */
.control-group { display: flex; flex-direction: column; gap: var(--space-xs); }
.control-label { font-size: 10px; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.control-row { display: flex; align-items: center; gap: var(--space-sm); }
.control-slider { flex: 1; accent-color: var(--color-primary); }
.control-value { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink); min-width: 44px; text-align: right; }
.button-row { display: flex; gap: var(--space-sm); align-items: center; }

.mode-options { display: flex; gap: var(--space-xs); }
.mode-btn {
  flex: 1;
  padding: var(--space-xs) 0;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  background: var(--color-surface-card);
  cursor: pointer;
  font-size: 10px;
  color: var(--color-body);
  transition: all 0.15s ease;
  text-align: center;
}
.mode-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }

.format-options { display: flex; gap: var(--space-xs); }
.format-btn {
  padding: var(--space-xs) var(--space-base);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  background: var(--color-surface-card);
  cursor: pointer;
  font-size: 10px;
  color: var(--color-body);
  transition: all 0.15s ease;
}
.format-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }

/* ── Queue ── */
.queue-list { display: flex; flex-direction: column; gap: var(--space-sm); max-height: 480px; overflow-y: auto; }

.queue-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  background: var(--color-surface-card);
  transition: border-color 0.15s ease;
}
.queue-item--done { border-color: rgba(31, 138, 101, 0.3); }
.queue-item--error { border-color: rgba(220, 53, 69, 0.3); }
.queue-item--processing { border-color: var(--color-primary); background: var(--color-canvas-soft); }

.queue-item__thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.queue-item__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.queue-item__name {
  font-size: var(--text-sm);
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.queue-item__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-muted);
}
.queue-item__compressed { color: var(--color-primary); font-weight: var(--weight-medium); }
.queue-item__ratio { color: #1f8a65; font-weight: var(--weight-semibold); }
.queue-item__error { color: #dc3545; }
.queue-item__processing { color: var(--color-primary); }

.queue-item__remove {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: 11px;
  opacity: 0;
  transition: all 0.15s ease;
}
.queue-item:hover .queue-item__remove { opacity: 1; }
.queue-item__remove:hover { color: #dc3545; background: rgba(220, 53, 69, 0.08); }
</style>
