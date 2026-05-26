/** 编辑器图层 */
export interface EditorLayer {
  id: string
  name: string
  image: HTMLImageElement
  /** 图层在画布上的 X 位置 */
  x: number
  /** 图层在画布上的 Y 位置 */
  y: number
  /** 图层显示宽度 */
  width: number
  height: number
  /** 是否可见 */
  visible: boolean
  /** 透明度 0~1 */
  opacity: number
  /** 是否锁定（锁定后不可拖动） */
  locked: boolean
}

/** 拖拽中的瓦片预览状态 */
export interface DragPreview {
  /** 源图引用 */
  sourceImage: HTMLImageElement
  /** 在源图上的裁剪区域 */
  sx: number
  sy: number
  sw: number
  sh: number
  /** 拖拽放置位置 */
  x: number
  y: number
  w: number
  h: number
}

/** 源图上的矩形选区（网格对齐） */
export interface SelectionRect {
  startCol: number
  startRow: number
  endCol: number
  endRow: number
}

/** 批量拖拽预览：整块区域从源图裁剪并拖拽 */
export interface BatchDragPreview {
  sourceImage: HTMLImageElement
  sx: number
  sy: number
  sw: number
  sh: number
  x: number
  y: number
  gridSize: number
  cols: number
  rows: number
}

/** 编辑器画布状态 */
export interface EditorCanvasState {
  /** 缩放比例 */
  zoom: number
  /** 画布平移 X */
  offsetX: number
  /** 画布平移 Y */
  offsetY: number
  /** 画布宽度 */
  canvasWidth: number
  /** 画布高度 */
  canvasHeight: number
  /** 是否显示网格 */
  showGrid: boolean
  /** 网格大小（=瓦片大小） */
  gridSize: number
  /** 是否吸附到网格 */
  snapToGrid: boolean
}
