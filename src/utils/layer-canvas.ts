import type { EditorLayer, EditorCanvasState, DragPreview, SelectionRect, BatchDragPreview } from '../types/editor'

/**
 * 渲染编辑器画布
 * - 棋盘格背景
 * - 瓦片集源图（带网格高亮）
 * - 已放置的图层
 * - 拖拽预览
 * - 选中边框
 */
export function renderEditor(
  ctx: CanvasRenderingContext2D,
  layers: EditorLayer[],
  canvasState: EditorCanvasState,
  selectedLayerId: string | null,
  tilesetSource: HTMLImageElement | null,
  hoverTile: { col: number; row: number } | null,
  dragPreview: DragPreview | null,
  selectionRect: SelectionRect | null = null,
  batchDragPreview: BatchDragPreview | null = null,
): void {
  const { zoom, offsetX, offsetY, canvasWidth, canvasHeight, showGrid, gridSize } = canvasState
  const displayW = ctx.canvas.width
  const displayH = ctx.canvas.height

  ctx.clearRect(0, 0, displayW, displayH)
  drawCheckerboard(ctx, displayW, displayH)

  ctx.save()
  ctx.translate(offsetX, offsetY)
  ctx.scale(zoom, zoom)

  // 画布区域白色背景
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // 绘制瓦片集源图（半透明参考底图）
  if (tilesetSource) {
    ctx.globalAlpha = 0.5
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(tilesetSource, 0, 0)
    ctx.globalAlpha = 1

    // 在源图上绘制网格线
    if (showGrid && gridSize > 0) {
      const srcW = tilesetSource.naturalWidth
      const srcH = tilesetSource.naturalHeight
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.lineWidth = 1 / zoom
      ctx.beginPath()
      for (let x = 0; x <= srcW; x += gridSize) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, srcH)
      }
      for (let y = 0; y <= srcH; y += gridSize) {
        ctx.moveTo(0, y)
        ctx.lineTo(srcW, y)
      }
      ctx.stroke()

      // 高亮悬停的格子（非拖拽/选区状态时）
      if (hoverTile && !dragPreview && !batchDragPreview && !selectionRect) {
        const hx = hoverTile.col * gridSize
        const hy = hoverTile.row * gridSize
        ctx.fillStyle = 'rgba(255, 200, 0, 0.3)'
        ctx.fillRect(hx, hy, gridSize, gridSize)
        ctx.strokeStyle = 'rgba(255, 180, 0, 0.8)'
        ctx.lineWidth = 2 / zoom
        ctx.strokeRect(hx, hy, gridSize, gridSize)
      }

      // 绘制橡皮筋选区
      if (selectionRect) {
        const selX = selectionRect.startCol * gridSize
        const selY = selectionRect.startRow * gridSize
        const selW = (selectionRect.endCol - selectionRect.startCol + 1) * gridSize
        const selH = (selectionRect.endRow - selectionRect.startRow + 1) * gridSize

        ctx.fillStyle = 'rgba(245, 78, 0, 0.15)'
        ctx.fillRect(selX, selY, selW, selH)

        ctx.strokeStyle = '#f54e00'
        ctx.lineWidth = 2 / zoom
        ctx.setLineDash([4 / zoom, 3 / zoom])
        ctx.strokeRect(selX, selY, selW, selH)
        ctx.setLineDash([])

        const cols = selectionRect.endCol - selectionRect.startCol + 1
        const rows = selectionRect.endRow - selectionRect.startRow + 1
        ctx.fillStyle = '#f54e00'
        ctx.font = `bold ${12 / zoom}px system-ui`
        ctx.fillText(`${cols}×${rows}`, selX + 2 / zoom, selY - 3 / zoom)
      }
    }
  }

  // 在画布区域绘制网格（源图之外的部分）
  if (showGrid && gridSize > 0) {
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'
    ctx.lineWidth = 1 / zoom
    ctx.beginPath()
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
    }
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
    }
    ctx.stroke()
  }

  // 绘制已放置的图层
  for (const layer of layers) {
    if (!layer.visible) continue
    ctx.globalAlpha = layer.opacity
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(layer.image, layer.x, layer.y, layer.width, layer.height)
  }

  // 绘制拖拽预览
  if (dragPreview) {
    ctx.globalAlpha = 0.7
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(
      dragPreview.sourceImage,
      dragPreview.sx, dragPreview.sy, dragPreview.sw, dragPreview.sh,
      dragPreview.x, dragPreview.y, dragPreview.w, dragPreview.h
    )
    // 预览边框
    ctx.globalAlpha = 1
    ctx.strokeStyle = '#f54e00'
    ctx.lineWidth = 2 / zoom
    ctx.setLineDash([4 / zoom, 3 / zoom])
    ctx.strokeRect(dragPreview.x, dragPreview.y, dragPreview.w, dragPreview.h)
    ctx.setLineDash([])
  }

  // 绘制批量拖拽预览
  if (batchDragPreview) {
    const { sourceImage, sx, sy, sw, sh, x: bx, y: by, gridSize: gs, cols, rows } = batchDragPreview
    ctx.globalAlpha = 0.7
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(sourceImage, sx, sy, sw, sh, bx, by, sw, sh)
    ctx.globalAlpha = 1

    // 整体边框
    ctx.strokeStyle = '#f54e00'
    ctx.lineWidth = 2 / zoom
    ctx.setLineDash([4 / zoom, 3 / zoom])
    ctx.strokeRect(bx, by, sw, sh)
    ctx.setLineDash([])

    // 内部网格线
    ctx.strokeStyle = 'rgba(245, 78, 0, 0.4)'
    ctx.lineWidth = 1 / zoom
    ctx.beginPath()
    for (let c = 1; c < cols; c++) {
      ctx.moveTo(bx + c * gs, by)
      ctx.lineTo(bx + c * gs, by + rows * gs)
    }
    for (let r = 1; r < rows; r++) {
      ctx.moveTo(bx, by + r * gs)
      ctx.lineTo(bx + cols * gs, by + r * gs)
    }
    ctx.stroke()

    // 尺寸标注
    ctx.fillStyle = '#f54e00'
    ctx.font = `bold ${12 / zoom}px system-ui`
    ctx.fillText(`${cols}×${rows}`, bx + 2 / zoom, by - 3 / zoom)
  }

  // 选中图层边框
  if (selectedLayerId && !dragPreview && !batchDragPreview) {
    const selected = layers.find(l => l.id === selectedLayerId)
    if (selected && selected.visible) {
      ctx.globalAlpha = 1
      ctx.strokeStyle = '#f54e00'
      ctx.lineWidth = 2 / zoom
      ctx.setLineDash([6 / zoom, 4 / zoom])
      ctx.strokeRect(selected.x - 1, selected.y - 1, selected.width + 2, selected.height + 2)
      ctx.setLineDash([])
    }
  }

  ctx.restore()
}

/** 绘制棋盘格背景 */
function drawCheckerboard(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const size = 10
  ctx.fillStyle = '#e0e0e0'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#f0f0f0'
  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
        ctx.fillRect(x, y, size, size)
      }
    }
  }
}

/** 像素级 Hit Test（对已放置的图层） */
export function hitTestLayers(
  layers: EditorLayer[],
  canvasX: number,
  canvasY: number
): EditorLayer | null {
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i]
    if (!layer.visible || layer.locked) continue
    if (
      canvasX >= layer.x &&
      canvasX < layer.x + layer.width &&
      canvasY >= layer.y &&
      canvasY < layer.y + layer.height
    ) {
      return layer
    }
  }
  return null
}

/** 屏幕坐标 → 画布坐标 */
export function screenToCanvas(
  clientX: number,
  clientY: number,
  canvasEl: HTMLCanvasElement,
  canvasState: EditorCanvasState
): { x: number; y: number } {
  const rect = canvasEl.getBoundingClientRect()
  const scaleX = canvasEl.width / rect.width
  const scaleY = canvasEl.height / rect.height
  const screenX = (clientX - rect.left) * scaleX
  const screenY = (clientY - rect.top) * scaleY
  return {
    x: (screenX - canvasState.offsetX) / canvasState.zoom,
    y: (screenY - canvasState.offsetY) / canvasState.zoom,
  }
}

/** 导出合成图 */
export function exportCompositeImage(
  layers: EditorLayer[],
  canvasWidth: number,
  canvasHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  for (const layer of layers) {
    if (!layer.visible) continue
    ctx.globalAlpha = layer.opacity
    ctx.drawImage(layer.image, layer.x, layer.y, layer.width, layer.height)
  }
  return canvas
}
