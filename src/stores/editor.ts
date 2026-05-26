import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EditorLayer, EditorCanvasState } from '../types/editor'

export const useEditorStore = defineStore('editor', () => {
  /** 图层列表（索引越大 = 越上层） */
  const layers = ref<EditorLayer[]>([])

  /** 当前选中图层 ID */
  const selectedLayerId = ref<string | null>(null)

  /** 画布状态 */
  const canvasState = ref<EditorCanvasState>({
    zoom: 2,
    offsetX: 0,
    offsetY: 0,
    canvasWidth: 256,
    canvasHeight: 256,
    showGrid: true,
    gridSize: 16,
    snapToGrid: true,
  })

  /** 瓦片集源图 */
  const tilesetSource = ref<HTMLImageElement | null>(null)

  /** 选中图层 */
  const selectedLayer = computed(() =>
    layers.value.find(l => l.id === selectedLayerId.value) ?? null
  )

  let layerCounter = 0

  /** 设置瓦片集源图 */
  function setTilesetSource(image: HTMLImageElement) {
    tilesetSource.value = image
  }

  /**
   * 从源图上裁剪一个瓦片区域，创建为新图层
   */
  function extractTileFromSource(sx: number, sy: number, sw: number, sh: number, placeX: number, placeY: number) {
    const tileCanvas = document.createElement('canvas')
    tileCanvas.width = sw
    tileCanvas.height = sh
    const tCtx = tileCanvas.getContext('2d')!
    tCtx.imageSmoothingEnabled = false
    tCtx.drawImage(tilesetSource.value!, sx, sy, sw, sh, 0, 0, sw, sh)

    const tileImage = new Image()
    tileImage.src = tileCanvas.toDataURL()

    const gs = canvasState.value.gridSize
    const snappedX = canvasState.value.snapToGrid ? Math.round(placeX / gs) * gs : placeX
    const snappedY = canvasState.value.snapToGrid ? Math.round(placeY / gs) * gs : placeY

    layerCounter++
    const col = Math.floor(sx / sw)
    const row = Math.floor(sy / sh)
    const layer: EditorLayer = {
      id: `tile-${Date.now()}-${layerCounter}`,
      name: `瓦片 (${col},${row})`,
      image: tileImage,
      x: snappedX,
      y: snappedY,
      width: sw,
      height: sh,
      visible: true,
      opacity: 1,
      locked: false,
    }
    layers.value.push(layer)
    selectedLayerId.value = layer.id
  }

  /**
   * 批量从源图裁剪选区区域，合并为一个图层
   * @param startCol 起始列, @param startRow 起始行
   * @param endCol 结束列(含), @param endRow 结束行(含)
   * @param placeBaseX 放置基准 X（选区左上角目标位置）
   * @param placeBaseY 放置基准 Y
   */
  function extractTilesFromSelection(
    startCol: number, startRow: number,
    endCol: number, endRow: number,
    placeBaseX: number, placeBaseY: number,
  ) {
    const gs = canvasState.value.gridSize
    const snap = canvasState.value.snapToGrid
    const snappedBaseX = snap ? Math.round(placeBaseX / gs) * gs : placeBaseX
    const snappedBaseY = snap ? Math.round(placeBaseY / gs) * gs : placeBaseY

    const cols = endCol - startCol + 1
    const rows = endRow - startRow + 1
    const sw = cols * gs
    const sh = rows * gs

    // 裁剪整块区域为一张图
    const tileCanvas = document.createElement('canvas')
    tileCanvas.width = sw
    tileCanvas.height = sh
    const tCtx = tileCanvas.getContext('2d')!
    tCtx.imageSmoothingEnabled = false
    tCtx.drawImage(tilesetSource.value!, startCol * gs, startRow * gs, sw, sh, 0, 0, sw, sh)

    const tileImage = new Image()
    tileImage.src = tileCanvas.toDataURL()

    layerCounter++
    const layer: EditorLayer = {
      id: `tile-${Date.now()}-${layerCounter}`,
      name: `瓦片组 (${cols}×${rows})`,
      image: tileImage,
      x: snappedBaseX,
      y: snappedBaseY,
      width: sw,
      height: sh,
      visible: true,
      opacity: 1,
      locked: false,
    }
    layers.value.push(layer)
    selectedLayerId.value = layer.id
  }

  /** 删除图层 */
  function removeLayer(id: string) {
    const idx = layers.value.findIndex(l => l.id === id)
    if (idx === -1) return
    layers.value.splice(idx, 1)
    if (selectedLayerId.value === id) {
      selectedLayerId.value = layers.value.length > 0
        ? layers.value[Math.min(idx, layers.value.length - 1)].id
        : null
    }
  }

  /** 移动图层顺序 */
  function moveLayer(id: string, direction: 'up' | 'down') {
    const idx = layers.value.findIndex(l => l.id === id)
    if (idx === -1) return
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1
    if (targetIdx < 0 || targetIdx >= layers.value.length) return
    const arr = [...layers.value]
    const temp = arr[idx]
    arr[idx] = arr[targetIdx]
    arr[targetIdx] = temp
    layers.value = arr
  }

  /** 更新图层位置 */
  function updateLayerPosition(id: string, x: number, y: number) {
    const layer = layers.value.find(l => l.id === id)
    if (!layer) return
    if (canvasState.value.snapToGrid) {
      const gs = canvasState.value.gridSize
      layer.x = Math.round(x / gs) * gs
      layer.y = Math.round(y / gs) * gs
    } else {
      layer.x = x
      layer.y = y
    }
  }

  /** 切换图层可见性 */
  function toggleLayerVisibility(id: string) {
    const layer = layers.value.find(l => l.id === id)
    if (layer) layer.visible = !layer.visible
  }

  /** 切换图层锁定 */
  function toggleLayerLock(id: string) {
    const layer = layers.value.find(l => l.id === id)
    if (layer) layer.locked = !layer.locked
  }

  /** 清空所有图层 */
  function clearLayers() {
    layers.value = []
    selectedLayerId.value = null
    layerCounter = 0
  }

  /** 重置画布视口 */
  function resetViewport() {
    canvasState.value.zoom = 2
    canvasState.value.offsetX = 0
    canvasState.value.offsetY = 0
  }

  return {
    layers,
    selectedLayerId,
    canvasState,
    selectedLayer,
    tilesetSource,
    setTilesetSource,
    extractTileFromSource,
    extractTilesFromSelection,
    removeLayer,
    moveLayer,
    updateLayerPosition,
    toggleLayerVisibility,
    toggleLayerLock,
    clearLayers,
    resetViewport,
  }
})
