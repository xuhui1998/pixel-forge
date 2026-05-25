/**
 * 水印添加工具
 * 支持文字水印和图片水印
 */

export interface TextWatermarkOptions {
  /** 水印文字内容 */
  text: string
  /** 字体大小 (px) */
  fontSize: number
  /** 字体颜色 */
  color: string
  /** 透明度 0-1 */
  opacity: number
  /** 旋转角度 (度)，如 -30 */
  rotation: number
  /** 位置模式 */
  position: WatermarkPosition
  /** 自定义 X 偏移（仅 position=custom 时生效） */
  offsetX: number
  /** 自定义 Y 偏移（仅 position=custom 时生效） */
  offsetY: number
  /** 是否平铺 */
  tile: boolean
  /** 平铺间距 X */
  tileGapX: number
  /** 平铺间距 Y */
  tileGapY: number
  /** 字体 */
  fontFamily: string
  /** 是否加粗 */
  bold: boolean
  /** 是否描边 */
  stroke: boolean
  /** 描边颜色 */
  strokeColor: string
}

export type WatermarkPosition =
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'custom'

export const WATERMARK_POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: 'center', label: '居中' },
  { value: 'top-left', label: '左上' },
  { value: 'top-right', label: '右上' },
  { value: 'bottom-left', label: '左下' },
  { value: 'bottom-right', label: '右下' },
  { value: 'custom', label: '自定义' },
]

export const WATERMARK_FONTS = [
  { value: 'sans-serif', label: '默认' },
  { value: '"Press Start 2P"', label: '像素字体' },
  { value: 'serif', label: '衬线' },
  { value: 'monospace', label: '等宽' },
]

export function addTextWatermark(
  sourceCanvas: HTMLCanvasElement,
  options: TextWatermarkOptions
): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = sourceCanvas.width
  c.height = sourceCanvas.height
  const ctx = c.getContext('2d')!

  // Draw original image
  ctx.drawImage(sourceCanvas, 0, 0)

  // Setup text style
  const weight = options.bold ? 'bold ' : ''
  const fontStr = `${weight}${options.fontSize}px ${options.fontFamily}`
  ctx.font = fontStr
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = options.opacity

  if (options.tile) {
    drawTiledWatermark(ctx, options, c.width, c.height)
  } else {
    drawSingleWatermark(ctx, options, c.width, c.height)
  }

  ctx.globalAlpha = 1
  return c
}

function drawSingleWatermark(
  ctx: CanvasRenderingContext2D,
  options: TextWatermarkOptions,
  canvasW: number,
  canvasH: number
) {
  const pos = calcPosition(options.position, canvasW, canvasH, options)
  ctx.save()
  ctx.translate(pos.x, pos.y)
  ctx.rotate((options.rotation * Math.PI) / 180)
  if (options.stroke) {
    ctx.strokeStyle = options.strokeColor
    ctx.lineWidth = Math.max(1, options.fontSize / 12)
    ctx.strokeText(options.text, 0, 0)
  }
  ctx.fillStyle = options.color
  ctx.fillText(options.text, 0, 0)
  ctx.restore()
}

function drawTiledWatermark(
  ctx: CanvasRenderingContext2D,
  options: TextWatermarkOptions,
  canvasW: number,
  canvasH: number
) {
  const textMetrics = measureTextApprox(ctx, options.text)
  const stepX = textMetrics.width + options.tileGapX
  const stepY = options.fontSize + options.tileGapY
  // Add extra margin to cover rotated tiles
  const margin = Math.max(canvasW, canvasH)

  ctx.save()
  ctx.translate(canvasW / 2, canvasH / 2)
  ctx.rotate((options.rotation * Math.PI) / 180)

  const startX = -margin
  const startY = -margin
  const endX = margin
  const endY = margin

  for (let y = startY; y < endY; y += stepY) {
    for (let x = startX; x < endX; x += stepX) {
      if (options.stroke) {
        ctx.strokeStyle = options.strokeColor
        ctx.lineWidth = Math.max(1, options.fontSize / 12)
        ctx.strokeText(options.text, x, y)
      }
      ctx.fillStyle = options.color
      ctx.fillText(options.text, x, y)
    }
  }
  ctx.restore()
}

function calcPosition(
  position: WatermarkPosition,
  canvasW: number,
  canvasH: number,
  options: TextWatermarkOptions
): { x: number; y: number } {
  const pad = Math.max(options.fontSize, 20)
  switch (position) {
    case 'center':
      return { x: canvasW / 2, y: canvasH / 2 }
    case 'top-left':
      return { x: pad, y: pad }
    case 'top-right':
      return { x: canvasW - pad, y: pad }
    case 'bottom-left':
      return { x: pad, y: canvasH - pad }
    case 'bottom-right':
      return { x: canvasW - pad, y: canvasH - pad }
    case 'custom':
      return { x: options.offsetX, y: options.offsetY }
    default:
      return { x: canvasW / 2, y: canvasH / 2 }
  }
}

function measureTextApprox(ctx: CanvasRenderingContext2D, text: string): { width: number } {
  try {
    return { width: ctx.measureText(text).width }
  } catch {
    // Fallback rough estimate
    return { width: text.length * 12 }
  }
}
