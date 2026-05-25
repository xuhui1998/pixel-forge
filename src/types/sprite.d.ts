export interface SpriteFrame {
  index: number
  canvas: HTMLCanvasElement
  width: number
  height: number
  offsetX: number
  offsetY: number
}

export interface SplitOptions {
  columns: number
  rows: number
  frameWidth?: number
  frameHeight?: number
  padding?: number
}

export interface MergeOptions {
  columns?: number
  padding?: number
  maxWidth?: number
}

export interface AnimationOptions {
  fps: number
  loop: boolean
}

export interface GifExportOptions {
  fps?: number
  quality?: number
  repeat?: number
  width?: number
  height?: number
}

export interface SpriteState {
  sourceFile: File | null
  sourceUrl: string
  frames: SpriteFrame[]
  currentFrameIndex: number
  isPlaying: boolean
  fps: number
  isProcessing: boolean
  error: string | null
}
