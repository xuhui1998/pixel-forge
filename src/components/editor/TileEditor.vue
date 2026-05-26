<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <!-- Left: Canvas Area -->
      <div class="tool-page__main">
        <div class="editor-canvas-area">
          <div class="canvas-toolbar">
            <span class="zoom-indicator">{{ Math.round(store.canvasState.zoom * 100) }}%</span>
            <button class="canvas-toolbar__btn" title="适应源图" @click="fitToSource">
              <Maximize :size="14" />
            </button>
            <button class="canvas-toolbar__btn" title="放大" @click="zoomIn">
              <ZoomIn :size="14" />
            </button>
            <button class="canvas-toolbar__btn" title="缩小" @click="zoomOut">
              <ZoomOut :size="14" />
            </button>
          </div>
          <div
            class="editor-viewport"
            ref="viewportRef"
            @wheel.prevent="onWheel"
            @mousedown.prevent="onCanvasMouseDown"
            @mousemove.prevent="onCanvasMouseMove"
            @mouseup="onCanvasMouseUp"
            @mouseleave="onCanvasMouseLeave"
            @contextmenu.prevent
          >
            <canvas ref="canvasRef" class="editor-canvas" />
          </div>
          <div class="canvas-status">
            <template v-if="store.selectedLayer">
              <span>选中: {{ store.selectedLayer.name }}</span>
              <span>位置: ({{ Math.round(store.selectedLayer.x) }}, {{ Math.round(store.selectedLayer.y) }})</span>
            </template>
            <template v-else-if="store.tilesetSource">
              <span style="color: var(--color-muted)">左键拖拽方块 | Shift+左键框选多个 | 右键平移</span>
            </template>
            <template v-else>
              <span style="color: var(--color-muted)">先在右侧上传瓦片集素材</span>
            </template>
          </div>
        </div>
      </div>

      <!-- Right: Sidebar -->
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Layers :size="16" />
          <px-text>瓦片编辑器</px-text>
        </div>

        <!-- Tileset Upload -->
        <px-card>
          <template #header>瓦片集素材</template>
          <div class="upload-area" @click="triggerTilesetUpload" @dragover.prevent @drop.prevent="onTilesetDrop">
            <Upload :size="20" />
            <p v-if="!store.tilesetSource">点击或拖拽上传瓦片集</p>
            <p v-else>已加载 ({{ store.tilesetSource.naturalWidth }}×{{ store.tilesetSource.naturalHeight }})</p>
            <input
              ref="tilesetInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onTilesetFileChange"
            />
          </div>
        </px-card>

        <!-- Grid Settings -->
        <px-card class="mt-base">
          <template #header>网格设置</template>
          <div class="control-group">
            <label class="control-label"><px-text>网格/瓦片大小 (px)</px-text></label>
            <PxNumberInput v-model="store.canvasState.gridSize" :min="1" :max="256" />
          </div>
          <div class="control-group mt-base">
            <PxSwitch v-model="store.canvasState.showGrid" label="显示网格" />
          </div>
          <div class="control-group mt-base">
            <PxSwitch v-model="store.canvasState.snapToGrid" label="吸附到网格" />
          </div>
        </px-card>

        <!-- Canvas Settings -->
        <px-card class="mt-base">
          <template #header>画布设置</template>
          <div class="control-group">
            <label class="control-label"><px-text>宽度 (px)</px-text></label>
            <PxNumberInput v-model="store.canvasState.canvasWidth" :min="1" :max="4096" />
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>高度 (px)</px-text></label>
            <PxNumberInput v-model="store.canvasState.canvasHeight" :min="1" :max="4096" />
          </div>
        </px-card>

        <!-- Layer List -->
        <px-card v-if="store.layers.length > 0" class="mt-base">
          <template #header>已放置图层 ({{ store.layers.length }})</template>
          <div class="layer-list">
            <div
              v-for="layer in reversedLayers"
              :key="layer.id"
              class="layer-item"
              :class="{ 'layer-item--selected': layer.id === store.selectedLayerId }"
              @click="store.selectedLayerId = layer.id"
            >
              <div class="layer-item__info">
                <span class="layer-item__name">{{ layer.name }}</span>
                <span class="layer-item__size">({{ Math.round(layer.x) }}, {{ Math.round(layer.y) }}) {{ layer.width }}×{{ layer.height }}</span>
              </div>
              <div class="layer-item__actions">
                <button
                  class="layer-btn"
                  :class="{ 'layer-btn--active': !layer.visible }"
                  title="显隐"
                  @click.stop="store.toggleLayerVisibility(layer.id)"
                >
                  <Eye v-if="layer.visible" :size="12" />
                  <EyeOff v-else :size="12" />
                </button>
                <button
                  class="layer-btn"
                  :class="{ 'layer-btn--active': layer.locked }"
                  title="锁定"
                  @click.stop="store.toggleLayerLock(layer.id)"
                >
                  <Unlock v-if="!layer.locked" :size="12" />
                  <Lock v-else :size="12" />
                </button>
                <button
                  class="layer-btn layer-btn--danger"
                  title="删除"
                  @click.stop="store.removeLayer(layer.id)"
                >
                  <Trash2 :size="12" />
                </button>
              </div>
            </div>
          </div>
        </px-card>

        <!-- Export -->
        <px-card v-if="store.layers.length > 0" class="mt-base">
          <template #header>导出</template>
          <div class="button-col">
            <px-button type="primary" @click="exportImage">
              <Download :size="14" /> 导出合成图 PNG
            </px-button>
            <px-button @click="store.clearLayers()">
              <Trash2 :size="14" /> 清空所有图层
            </px-button>
          </div>
        </px-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Layers, Upload, Download, Trash2, Eye, EyeOff, Lock, Unlock,
  Maximize, ZoomIn, ZoomOut,
} from 'lucide-vue-next'
import { useEditorStore } from '../../stores/editor'
import { renderEditor, hitTestLayers, screenToCanvas, exportCompositeImage } from '../../utils/layer-canvas'
import type { DragPreview, SelectionRect, BatchDragPreview } from '../../types/editor'

const store = useEditorStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const viewportRef = ref<HTMLDivElement | null>(null)
const tilesetInputRef = ref<HTMLInputElement | null>(null)

// ===================== 拖拽状态 =====================

type DragMode = 'none' | 'tile-extract' | 'batch-extract' | 'select' | 'layer-move' | 'pan'

let dragMode: DragMode = 'none'
let dragStartX = 0
let dragStartY = 0

// 从源图拖拽瓦片
let extractSx = 0
let extractSy = 0

// 移动已有图层
let moveLayerId: string | null = null
let moveLayerStartX = 0
let moveLayerStartY = 0

// 平移画布
let panStartOffsetX = 0
let panStartOffsetY = 0

// 空格键
let spacePressed = false

// 拖拽预览
const dragPreview = ref<DragPreview | null>(null)

// 橡皮筋选区
const selectionRect = ref<SelectionRect | null>(null)
let selectStartCol = 0
let selectStartRow = 0

// 批量拖拽预览
const batchDragPreview = ref<BatchDragPreview | null>(null)
let batchSx = 0
let batchSy = 0
let batchCols = 0
let batchRows = 0

// 鼠标悬停的源图格子
const hoverTile = ref<{ col: number; row: number } | null>(null)

const reversedLayers = computed(() => [...store.layers].reverse())

// ===================== 瓦片集上传 =====================

function triggerTilesetUpload() {
  tilesetInputRef.value?.click()
}

function onTilesetFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.[0]) return
  loadTileset(input.files[0])
  input.value = ''
}

function onTilesetDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) loadTileset(file)
}

function loadTileset(file: File) {
  const img = new Image()
  img.onload = () => {
    store.setTilesetSource(img)
    const gs = store.canvasState.gridSize
    store.canvasState.canvasWidth = Math.max(store.canvasState.canvasWidth, img.naturalWidth + gs * 8)
    store.canvasState.canvasHeight = Math.max(store.canvasState.canvasHeight, img.naturalHeight + gs * 8)
    nextTick(() => fitToSource())
  }
  img.src = URL.createObjectURL(file)
}

// ===================== 渲染 =====================

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  renderEditor(
    ctx, store.layers, store.canvasState,
    store.selectedLayerId,
    store.tilesetSource,
    hoverTile.value,
    dragPreview.value,
    selectionRect.value,
    batchDragPreview.value
  )
}

function resizeCanvas() {
  const canvas = canvasRef.value
  const viewport = viewportRef.value
  if (!canvas || !viewport) return
  canvas.width = viewport.clientWidth
  canvas.height = viewport.clientHeight
  render()
}

watch(
  () => [store.layers, store.selectedLayerId, store.canvasState, store.tilesetSource],
  () => render(),
  { deep: true }
)

// ===================== 缩放 & 视口 =====================

function onWheel(e: WheelEvent) {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newZoom = Math.min(10, Math.max(0.1, store.canvasState.zoom + delta))
  store.canvasState.zoom = Math.round(newZoom * 10) / 10
}

function zoomIn() {
  store.canvasState.zoom = Math.min(10, Math.round((store.canvasState.zoom + 0.2) * 10) / 10)
}

function zoomOut() {
  store.canvasState.zoom = Math.max(0.1, Math.round((store.canvasState.zoom - 0.2) * 10) / 10)
}

function fitToSource() {
  const viewport = viewportRef.value
  if (!viewport || !store.tilesetSource) return
  const img = store.tilesetSource
  const pad = 10
  const scaleX = (viewport.clientWidth - pad * 2) / img.naturalWidth
  const scaleY = (viewport.clientHeight - pad * 2) / img.naturalHeight
  const zoom = Math.min(scaleX, scaleY, 1) // 不超过原始大小
  store.canvasState.zoom = Math.round(zoom * 10) / 10
  store.canvasState.offsetX = pad
  store.canvasState.offsetY = pad
}

// ===================== 鼠标交互核心 =====================

function isOnSourceImage(cx: number, cy: number): boolean {
  if (!store.tilesetSource) return false
  return cx >= 0 && cy >= 0 &&
    cx < store.tilesetSource.naturalWidth &&
    cy < store.tilesetSource.naturalHeight
}

function getTileAt(cx: number, cy: number): { col: number; row: number } | null {
  if (!isOnSourceImage(cx, cy)) return null
  const gs = store.canvasState.gridSize
  return { col: Math.floor(cx / gs), row: Math.floor(cy / gs) }
}

function onCanvasMouseDown(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return

  // 右键、中键或空格+左键 → 平移
  if (e.button === 1 || e.button === 2 || (e.button === 0 && spacePressed)) {
    dragMode = 'pan'
    dragStartX = e.clientX
    dragStartY = e.clientY
    panStartOffsetX = store.canvasState.offsetX
    panStartOffsetY = store.canvasState.offsetY
    return
  }

  if (e.button !== 0) return

  const pos = screenToCanvas(e.clientX, e.clientY, canvas, store.canvasState)

  // 1. 先检查是否点击了已有的已放置图层
  const hit = hitTestLayers(store.layers, pos.x, pos.y)
  if (hit && !hit.locked) {
    dragMode = 'layer-move'
    moveLayerId = hit.id
    store.selectedLayerId = hit.id
    dragStartX = pos.x
    dragStartY = pos.y
    moveLayerStartX = hit.x
    moveLayerStartY = hit.y
    selectionRect.value = null
    return
  }

  // 2. 检查是否点击了源图上的格子
  if (isOnSourceImage(pos.x, pos.y)) {
    const gs = store.canvasState.gridSize
    const col = Math.floor(pos.x / gs)
    const row = Math.floor(pos.y / gs)

    // Shift + 左键 → 橡皮筋多选
    if (e.shiftKey) {
      dragMode = 'select'
      selectStartCol = col
      selectStartRow = row
      selectionRect.value = { startCol: col, startRow: row, endCol: col, endRow: row }
      store.selectedLayerId = null
      dragPreview.value = null
      return
    }

    // 普通左键 → 单格拖拽
    extractSx = col * gs
    extractSy = row * gs

    dragMode = 'tile-extract'
    dragStartX = pos.x
    dragStartY = pos.y
    store.selectedLayerId = null
    selectionRect.value = null

    dragPreview.value = {
      sourceImage: store.tilesetSource!,
      sx: extractSx,
      sy: extractSy,
      sw: gs,
      sh: gs,
      x: extractSx,
      y: extractSy,
      w: gs,
      h: gs,
    }
    return
  }

  // 3. 点击空白区域 → 取消选择
  store.selectedLayerId = null
  selectionRect.value = null
}

function onCanvasMouseMove(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  const pos = screenToCanvas(e.clientX, e.clientY, canvas, store.canvasState)

  if (dragMode === 'pan') {
    store.canvasState.offsetX = panStartOffsetX + (e.clientX - dragStartX)
    store.canvasState.offsetY = panStartOffsetY + (e.clientY - dragStartY)
    return
  }

  // 橡皮筋选区
  if (dragMode === 'select') {
    if (isOnSourceImage(pos.x, pos.y)) {
      const gs = store.canvasState.gridSize
      const curCol = Math.floor(pos.x / gs)
      const curRow = Math.floor(pos.y / gs)
      if (selectionRect.value) {
        selectionRect.value = {
          startCol: Math.min(selectStartCol, curCol),
          startRow: Math.min(selectStartRow, curRow),
          endCol: Math.max(selectStartCol, curCol),
          endRow: Math.max(selectStartRow, curRow),
        }
      }
    }
    render()
    return
  }

  // 批量拖拽预览
  if (dragMode === 'batch-extract' && batchDragPreview.value) {
    const gs = store.canvasState.gridSize
    let placeX = pos.x - (batchCols * gs) / 2
    let placeY = pos.y - (batchRows * gs) / 2
    if (store.canvasState.snapToGrid) {
      placeX = Math.round(placeX / gs) * gs
      placeY = Math.round(placeY / gs) * gs
    }
    batchDragPreview.value.x = placeX
    batchDragPreview.value.y = placeY
    render()
    return
  }

  if (dragMode === 'tile-extract' && dragPreview.value) {
    const gs = store.canvasState.gridSize
    let placeX = pos.x - gs / 2
    let placeY = pos.y - gs / 2
    if (store.canvasState.snapToGrid) {
      placeX = Math.round(placeX / gs) * gs
      placeY = Math.round(placeY / gs) * gs
    }
    dragPreview.value.x = placeX
    dragPreview.value.y = placeY
    render()
    return
  }

  if (dragMode === 'layer-move' && moveLayerId) {
    const dx = pos.x - dragStartX
    const dy = pos.y - dragStartY
    store.updateLayerPosition(moveLayerId, moveLayerStartX + dx, moveLayerStartY + dy)
    return
  }

  // 悬停高亮
  if (dragMode === 'none') {
    const tile = getTileAt(pos.x, pos.y)
    const prev = hoverTile.value
    if (!prev || !tile || prev.col !== tile.col || prev.row !== tile.row) {
      hoverTile.value = tile
      render()
    }
  }
}

function onCanvasMouseUp(e: MouseEvent) {
  const canvas = canvasRef.value

  // 橡皮筋选区释放 → 如果选区有效（大于1格），进入批量拖拽模式；否则取消
  if (dragMode === 'select' && selectionRect.value) {
    const { startCol, startRow, endCol, endRow } = selectionRect.value
    const cols = endCol - startCol + 1
    const rows = endRow - startRow + 1

    if (cols >= 1 && rows >= 1 && (cols > 1 || rows > 1)) {
      // 多选 → 进入批量拖拽模式
      const gs = store.canvasState.gridSize
      batchSx = startCol * gs
      batchSy = startRow * gs
      batchCols = cols
      batchRows = rows
      const sw = cols * gs
      const sh = rows * gs

      dragMode = 'batch-extract'
      selectionRect.value = null

      batchDragPreview.value = {
        sourceImage: store.tilesetSource!,
        sx: batchSx,
        sy: batchSy,
        sw,
        sh,
        x: batchSx,
        y: batchSy,
        gridSize: gs,
        cols,
        rows,
      }
    } else {
      // 单格或空选 → 取消选区
      selectionRect.value = null
      dragMode = 'none'
    }
    render()
    return
  }

  // 批量拖拽释放
  if (dragMode === 'batch-extract' && batchDragPreview.value && canvas) {
    const gs = store.canvasState.gridSize
    const pos = screenToCanvas(e.clientX, e.clientY, canvas, store.canvasState)
    let placeX = pos.x - (batchCols * gs) / 2
    let placeY = pos.y - (batchRows * gs) / 2
    if (store.canvasState.snapToGrid) {
      placeX = Math.round(placeX / gs) * gs
      placeY = Math.round(placeY / gs) * gs
    }
    const moved = Math.abs(placeX - batchSx) > 1 || Math.abs(placeY - batchSy) > 1
    if (moved) {
      store.extractTilesFromSelection(
        Math.floor(batchSx / gs),
        Math.floor(batchSy / gs),
        Math.floor(batchSx / gs) + batchCols - 1,
        Math.floor(batchSy / gs) + batchRows - 1,
        placeX, placeY
      )
    }
  }

  // 单格拖拽释放
  if (dragMode === 'tile-extract' && dragPreview.value && canvas) {
    const gs = store.canvasState.gridSize
    const pos = screenToCanvas(e.clientX, e.clientY, canvas, store.canvasState)
    let placeX = pos.x - gs / 2
    let placeY = pos.y - gs / 2
    if (store.canvasState.snapToGrid) {
      placeX = Math.round(placeX / gs) * gs
      placeY = Math.round(placeY / gs) * gs
    }
    const moved = Math.abs(placeX - extractSx) > 1 || Math.abs(placeY - extractSy) > 1
    if (moved) {
      store.extractTileFromSource(extractSx, extractSy, gs, gs, placeX, placeY)
    }
  }

  dragMode = 'none'
  dragPreview.value = null
  batchDragPreview.value = null
  selectionRect.value = null
  moveLayerId = null
  render()
}

function onCanvasMouseLeave() {
  hoverTile.value = null
  if (dragMode === 'tile-extract') {
    dragMode = 'none'
    dragPreview.value = null
  }
  if (dragMode === 'batch-extract') {
    dragMode = 'none'
    batchDragPreview.value = null
  }
  if (dragMode === 'select') {
    dragMode = 'none'
    selectionRect.value = null
  }
  render()
}

// ===================== 键盘 =====================

function onKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space') {
    spacePressed = true
    e.preventDefault()
  }
  if (e.code === 'Delete' || e.code === 'Backspace') {
    if (store.selectedLayerId) store.removeLayer(store.selectedLayerId)
  }
}

function onKeyUp(e: KeyboardEvent) {
  if (e.code === 'Space') spacePressed = false
}

// ===================== 导出 =====================

function exportImage() {
  const { canvasWidth, canvasHeight } = store.canvasState
  const resultCanvas = exportCompositeImage(store.layers, canvasWidth, canvasHeight)
  const link = document.createElement('a')
  link.download = 'tilemap.png'
  link.href = resultCanvas.toDataURL('image/png')
  link.click()
}

// ===================== 生命周期 =====================

onMounted(() => {
  nextTick(() => resizeCanvas())
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.tool-page__body { gap: 0; }
.tool-page__main { padding: 0 !important; overflow: hidden; align-items: stretch; justify-content: flex-start; }
.tool-page__sidebar {
  border-right: none;
  border-left: 1px solid var(--color-hairline);
  width: 260px;
  flex-shrink: 0;
}

.tool-page__sidebar-title {
  display: flex; align-items: center; gap: var(--space-xs);
  font-size: var(--text-md); font-weight: var(--weight-semibold); color: var(--color-ink);
  margin-bottom: var(--space-base);
}

.editor-canvas-area { display: flex; flex-direction: column; height: 100%; }

.canvas-toolbar {
  display: flex; align-items: center; gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-bottom: 1px solid var(--color-hairline);
  background: var(--color-surface-card);
}
.canvas-toolbar__btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  border: 1px solid var(--color-hairline); border-radius: var(--radius-sm);
  background: var(--color-surface-card); color: var(--color-body);
  cursor: pointer; transition: all var(--transition-fast);
}
.canvas-toolbar__btn:hover { color: var(--color-ink); border-color: var(--color-hairline-strong); }
.zoom-indicator {
  font-size: var(--text-sm); font-weight: var(--weight-medium);
  color: var(--color-body); margin-right: auto; font-family: var(--font-mono);
}

.editor-viewport {
  flex: 1; overflow: hidden; cursor: default;
  position: relative; background: var(--color-canvas);
}
.editor-canvas { display: block; width: 100%; height: 100%; }

.canvas-status {
  display: flex; align-items: center; gap: var(--space-md);
  padding: var(--space-xs) var(--space-sm);
  border-top: 1px solid var(--color-hairline);
  background: var(--color-surface-card);
  font-size: var(--text-xs); color: var(--color-body); font-family: var(--font-mono);
}

.upload-area {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--space-xs); padding: var(--space-sm);
  border: 2px dashed var(--color-hairline); border-radius: var(--radius-md);
  cursor: pointer; color: var(--color-muted); transition: all var(--transition-fast);
}
.upload-area:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-canvas-soft); }
.upload-area p { font-size: var(--text-xs); margin: 0; }

.layer-list { display: flex; flex-direction: column; gap: 2px; }
.layer-item {
  display: flex; align-items: center; gap: var(--space-xs);
  padding: var(--space-xxs) var(--space-xs); border-radius: var(--radius-sm);
  cursor: pointer; transition: all var(--transition-fast); border: 1px solid transparent;
}
.layer-item:hover { background: var(--color-canvas-soft); }
.layer-item--selected { background: var(--color-canvas-soft); border-color: var(--color-primary); }
.layer-item__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.layer-item__name { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.layer-item__size { font-size: var(--text-xs); color: var(--color-muted); font-family: var(--font-mono); }
.layer-item__actions { display: flex; align-items: center; gap: 1px; flex-shrink: 0; }
.layer-btn {
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border: none; border-radius: var(--radius-xs);
  background: transparent; color: var(--color-muted); cursor: pointer;
  transition: all var(--transition-fast);
}
.layer-btn:hover { background: var(--color-surface-strong); color: var(--color-ink); }
.layer-btn--active { color: var(--color-primary); }
.layer-btn--danger:hover { color: var(--color-pixel-red); background: rgba(207, 45, 86, 0.1); }

.button-col { display: flex; flex-direction: column; gap: var(--space-xs); }
.control-group { display: flex; flex-direction: column; gap: var(--space-xxs); align-items: flex-start; }
.control-label { font-size: var(--text-sm); color: var(--color-body); }
.mt-base { margin-top: var(--space-base); }
</style>
