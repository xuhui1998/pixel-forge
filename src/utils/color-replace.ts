/**
 * Color replacement utilities for pixel art
 */
export interface ColorReplaceOptions {
  sourceColor: [number, number, number]
  targetColor: [number, number, number]
  tolerance: number
  preserveShading: boolean
}

/**
 * Replace colors in ImageData while preserving shading
 */
export function replaceColor(
  sourceCanvas: HTMLCanvasElement,
  options: ColorReplaceOptions
): HTMLCanvasElement {
  const { width, height } = sourceCanvas
  const ctx = sourceCanvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, width, height)
  const { data } = imageData

  const [sr, sg, sb] = options.sourceColor
  const [tr, tg, tb] = options.targetColor

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
    if (a === 0) continue

    const dist = Math.sqrt((r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2)

    if (dist <= options.tolerance) {
      if (options.preserveShading) {
        const srcLuminance = (0.299 * sr + 0.587 * sg + 0.114 * sb) / 255
        const pixelLuminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        const ratio = srcLuminance > 0 ? pixelLuminance / srcLuminance : 1

        data[i]     = Math.min(255, Math.round(tr * ratio))
        data[i + 1] = Math.min(255, Math.round(tg * ratio))
        data[i + 2] = Math.min(255, Math.round(tb * ratio))
      } else {
        data[i]     = tr
        data[i + 1] = tg
        data[i + 2] = tb
      }
    }
  }

  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = width
  resultCanvas.height = height
  const resultCtx = resultCanvas.getContext('2d')!
  resultCtx.putImageData(imageData, 0, 0)
  return resultCanvas
}

/**
 * Extract palette from an image (most common colors)
 */
export function extractPalette(
  sourceCanvas: HTMLCanvasElement,
  maxColors: number = 16
): [number, number, number][] {
  const ctx = sourceCanvas.getContext('2d')!
  const { data } = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
  const colorMap = new Map<string, { count: number; rgb: [number, number, number] }>()

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    if (a < 128) continue // skip transparent
    const r = data[i], g = data[i + 1], b = data[i + 2]
    // Quantize to reduce similar colors
    const qr = Math.round(r / 8) * 8
    const qg = Math.round(g / 8) * 8
    const qb = Math.round(b / 8) * 8
    const key = `${qr},${qg},${qb}`

    const existing = colorMap.get(key)
    if (existing) {
      existing.count++
    } else {
      colorMap.set(key, { count: 1, rgb: [qr, qg, qb] })
    }
  }

  return Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors)
    .map(item => item.rgb)
}
