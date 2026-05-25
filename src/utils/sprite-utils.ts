/**
 * Sprite sheet utilities - split, merge, and manipulate sprite sheets
 */
import type { SpriteFrame, SplitOptions, MergeOptions } from '../types/sprite'

/**
 * Split sprite sheet by grid
 */
export function splitSpriteSheet(
  sourceCanvas: HTMLCanvasElement,
  options: SplitOptions
): SpriteFrame[] {
  const { width, height } = sourceCanvas
  const frames: SpriteFrame[] = []

  let frameW: number, frameH: number
  if (options.frameWidth && options.frameHeight) {
    frameW = options.frameWidth
    frameH = options.frameHeight
  } else {
    frameW = Math.floor(width / options.columns)
    frameH = Math.floor(height / options.rows)
  }

  const cols = options.frameWidth ? Math.floor(width / frameW) : options.columns
  const rows = options.frameHeight ? Math.floor(height / frameH) : options.rows
  const padding = options.padding ?? 0
  let index = 0

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = col * (frameW + padding)
      const offsetY = row * (frameH + padding)

      if (offsetX + frameW > width || offsetY + frameH > height) continue

      const frameCanvas = document.createElement('canvas')
      frameCanvas.width = frameW
      frameCanvas.height = frameH
      const ctx = frameCanvas.getContext('2d')!
      ctx.drawImage(sourceCanvas, offsetX, offsetY, frameW, frameH, 0, 0, frameW, frameH)

      frames.push({ index, canvas: frameCanvas, width: frameW, height: frameH, offsetX, offsetY })
      index++
    }
  }

  return frames
}

/**
 * Merge frames into a sprite sheet
 */
export function mergeFrames(
  frames: HTMLCanvasElement[],
  options: MergeOptions = {}
): HTMLCanvasElement {
  const { padding = 0 } = options
  if (frames.length === 0) {
    const empty = document.createElement('canvas')
    empty.width = 1
    empty.height = 1
    return empty
  }

  const frameW = frames[0].width
  const frameH = frames[0].height
  const totalFrames = frames.length

  const cols = options.columns ?? Math.ceil(Math.sqrt(totalFrames))
  const rows = Math.ceil(totalFrames / cols)

  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = cols * (frameW + padding) - padding
  resultCanvas.height = rows * (frameH + padding) - padding
  const ctx = resultCanvas.getContext('2d')!

  frames.forEach((frame, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * (frameW + padding)
    const y = row * (frameH + padding)
    ctx.drawImage(frame, x, y)
  })

  return resultCanvas
}
