export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/bmp'

export interface ImageProcessOptions {
  quality?: number
  maxSizeMB?: number
  maxWidthOrHeight?: number
}

export interface PixelateOptions {
  pixelSize: number
}

export interface ColorReplaceOptions {
  sourceColor: [number, number, number]
  targetColor: [number, number, number]
  tolerance: number
  preserveShading: boolean
}

export interface ResizeOptions {
  width: number
  height: number
  maintainRatio: boolean
  quality?: number
}

export interface CompressOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  quality?: number
  fileType?: string
}

export interface ProcessedImage {
  blob: Blob
  url: string
  width: number
  height: number
  format: string
  size: number
}

export interface ImageState {
  originalFile: File | null
  originalUrl: string
  processedImages: ProcessedImage[]
  isProcessing: boolean
  progress: number
  error: string | null
}
