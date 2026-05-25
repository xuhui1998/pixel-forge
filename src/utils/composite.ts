/* ═══════════════════════════════════════════════
   Image Composite / Blend Modes
   ═══════════════════════════════════════════════ */

export type BlendMode =
  | 'source-over' | 'multiply' | 'screen' | 'overlay'
  | 'darken' | 'lighten' | 'color-dodge' | 'color-burn'
  | 'hard-light' | 'soft-light' | 'difference' | 'exclusion'
  | 'hue' | 'saturation' | 'color' | 'luminosity'

export interface CompositeOptions {
  blendMode: BlendMode
  opacity: number     // 0-1
  offsetX: number     // overlay X offset
  offsetY: number     // overlay Y offset
}

/**
 * Composite two canvases with specified blend mode
 */
export function compositeImages(
  baseCanvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
  options: CompositeOptions
): HTMLCanvasElement {
  const { width, height } = baseCanvas
  const result = document.createElement('canvas')
  result.width = width
  result.height = height
  const ctx = result.getContext('2d')!

  // Draw base
  ctx.drawImage(baseCanvas, 0, 0)

  // Draw overlay with blend mode
  ctx.globalCompositeOperation = options.blendMode
  ctx.globalAlpha = options.opacity
  ctx.drawImage(overlayCanvas, options.offsetX, options.offsetY)

  // Reset
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1

  return result
}

export const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: 'source-over', label: '正常' },
  { value: 'multiply', label: '正片叠底' },
  { value: 'screen', label: '滤色' },
  { value: 'overlay', label: '叠加' },
  { value: 'darken', label: '变暗' },
  { value: 'lighten', label: '变亮' },
  { value: 'color-dodge', label: '颜色减淡' },
  { value: 'color-burn', label: '颜色加深' },
  { value: 'hard-light', label: '强光' },
  { value: 'soft-light', label: '柔光' },
  { value: 'difference', label: '差值' },
  { value: 'exclusion', label: '排除' },
  { value: 'hue', label: '色相' },
  { value: 'saturation', label: '饱和度' },
  { value: 'color', label: '颜色' },
  { value: 'luminosity', label: '明度' },
]
