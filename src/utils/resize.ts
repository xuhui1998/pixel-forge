/**
 * Image resize utility using pica for high-quality scaling
 */
import pica from 'pica'

export async function resizeImage(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  options: {
    quality?: number
    unsharpAmount?: number
    alpha?: boolean
  } = {}
): Promise<HTMLCanvasElement> {
  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = targetWidth
  resultCanvas.height = targetHeight

  const picaInstance = pica()

  await picaInstance.resize(sourceCanvas, resultCanvas, {
    quality: (options.quality ?? 3) as any,
    unsharpAmount: options.unsharpAmount ?? 80,
    unsharpRadius: 0.6,
    unsharpThreshold: 2,
  } as any)

  return resultCanvas
}

/**
 * Pixel-art friendly resize (nearest neighbor)
 */
export function pixelResize(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = targetWidth
  resultCanvas.height = targetHeight
  const ctx = resultCanvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight)
  return resultCanvas
}
