/* ═══════════════════════════════════════════════
   Nine-Slice (9-Slice) Cutting
   ═══════════════════════════════════════════════ */

export interface NineSliceConfig {
  top: number
  bottom: number
  left: number
  right: number
}

export interface NineSliceResult {
  slices: Record<string, HTMLCanvasElement>
  config: NineSliceConfig
  originalSize: { width: number; height: number }
}

const REGION_NAMES = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'middle-center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
] as const

/**
 * Split a canvas into 9 regions using 4 cutting lines
 */
export function nineSlice(
  sourceCanvas: HTMLCanvasElement,
  config: NineSliceConfig
): NineSliceResult {
  const { width, height } = sourceCanvas
  const { top, bottom, left, right } = config

  const regions: [string, number, number, number, number][] = [
    ['top-left', 0, 0, left, top],
    ['top-center', left, 0, width - right - left, top],
    ['top-right', width - right, 0, right, top],
    ['middle-left', 0, top, left, height - top - bottom],
    ['middle-center', left, top, width - right - left, height - top - bottom],
    ['middle-right', width - right, top, right, height - top - bottom],
    ['bottom-left', 0, height - bottom, left, bottom],
    ['bottom-center', left, height - bottom, width - right - left, bottom],
    ['bottom-right', width - right, height - bottom, right, bottom],
  ]

  const slices: Record<string, HTMLCanvasElement> = {}
  for (const [name, sx, sy, sw, sh] of regions) {
    const c = document.createElement('canvas')
    c.width = Math.max(1, sw)
    c.height = Math.max(1, sh)
    c.getContext('2d')!.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, sw, sh)
    slices[name] = c
  }

  return { slices, config, originalSize: { width, height } }
}

/**
 * Render nine-slice result at a target size
 */
export function drawNineSlice(
  result: NineSliceResult,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const { slices, config } = result
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  const { top, bottom, left, right } = config
  const innerW = targetWidth - left - right
  const innerH = targetHeight - top - bottom

  // Corners (fixed)
  ctx.drawImage(slices['top-left'], 0, 0)
  ctx.drawImage(slices['top-right'], targetWidth - right, 0)
  ctx.drawImage(slices['bottom-left'], 0, targetHeight - bottom)
  ctx.drawImage(slices['bottom-right'], targetWidth - right, targetHeight - bottom)

  // Edges (1D stretch)
  ctx.drawImage(slices['top-center'], left, 0, innerW, top)
  ctx.drawImage(slices['bottom-center'], left, targetHeight - bottom, innerW, bottom)
  ctx.drawImage(slices['middle-left'], 0, top, left, innerH)
  ctx.drawImage(slices['middle-right'], targetWidth - right, top, right, innerH)

  // Center (2D stretch)
  ctx.drawImage(slices['middle-center'], left, top, innerW, innerH)

  return canvas
}

export const REGION_NAMES_LIST = REGION_NAMES
