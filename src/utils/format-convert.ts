/**
 * Image format conversion utilities
 */
import { canvasToBlob } from './canvas'
import type { ImageFormat } from '../types/image'

/**
 * Convert canvas to target image format
 */
export async function convertFormat(
  canvas: HTMLCanvasElement,
  targetFormat: ImageFormat,
  quality: number = 0.92
): Promise<Blob> {
  // JPEG doesn't support transparency - fill white background
  if (targetFormat === 'image/jpeg') {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const ctx = tempCanvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(canvas, 0, 0)
    return canvasToBlob(tempCanvas, targetFormat, quality)
  }

  return canvasToBlob(canvas, targetFormat, quality)
}

/**
 * Get file extension from MIME type
 */
export function getExtension(format: ImageFormat): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
  }
  return map[format] || 'png'
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(ext: string): ImageFormat {
  const map: Record<string, ImageFormat> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    bmp: 'image/bmp',
  }
  return map[ext.toLowerCase()] || 'image/png'
}
