/* ═══════════════════════════════════════════════
   Mosaic / Pixelation Blur
   ═══════════════════════════════════════════════ */

export interface MosaicOptions {
  blockSize: number
  region?: {
    x: number; y: number
    width: number; height: number
  }
}

/**
 * Apply mosaic / pixelation blur to a canvas region
 */
export function applyMosaic(
  sourceCanvas: HTMLCanvasElement,
  options: MosaicOptions
): HTMLCanvasElement {
  const { width, height } = sourceCanvas
  const result = document.createElement('canvas')
  result.width = width
  result.height = height
  const ctx = result.getContext('2d')!

  // Draw original
  ctx.drawImage(sourceCanvas, 0, 0)

  const region = options.region ?? { x: 0, y: 0, width, height }
  const { blockSize } = options

  // Clamp region
  const rx = Math.max(0, Math.round(region.x))
  const ry = Math.max(0, Math.round(region.y))
  const rw = Math.min(Math.round(region.width), width - rx)
  const rh = Math.min(Math.round(region.height), height - ry)

  if (rw <= 0 || rh <= 0) return result

  const imageData = ctx.getImageData(rx, ry, rw, rh)
  const { data } = imageData

  for (let by = 0; by < rh; by += blockSize) {
    for (let bx = 0; bx < rw; bx += blockSize) {
      let totalR = 0, totalG = 0, totalB = 0, count = 0

      const bw = Math.min(blockSize, rw - bx)
      const bh = Math.min(blockSize, rh - by)

      // Calculate average color for this block
      for (let dy = 0; dy < bh; dy++) {
        for (let dx = 0; dx < bw; dx++) {
          const idx = ((by + dy) * rw + (bx + dx)) * 4
          totalR += data[idx]
          totalG += data[idx + 1]
          totalB += data[idx + 2]
          count++
        }
      }

      const avgR = Math.round(totalR / count)
      const avgG = Math.round(totalG / count)
      const avgB = Math.round(totalB / count)

      // Fill block with average color
      for (let dy = 0; dy < bh; dy++) {
        for (let dx = 0; dx < bw; dx++) {
          const idx = ((by + dy) * rw + (bx + dx)) * 4
          data[idx] = avgR
          data[idx + 1] = avgG
          data[idx + 2] = avgB
        }
      }
    }
  }

  ctx.putImageData(imageData, rx, ry)
  return result
}
