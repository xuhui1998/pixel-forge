/* ═══════════════════════════════════════════════
   Mirror Flip & Rotate Transform
   ═══════════════════════════════════════════════ */

export type FlipDirection = 'horizontal' | 'vertical'
export type RotateAngle = 90 | 180 | 270

/**
 * Mirror flip a canvas
 */
export function flipCanvas(
  sourceCanvas: HTMLCanvasElement,
  direction: FlipDirection
): HTMLCanvasElement {
  const { width, height } = sourceCanvas
  const result = document.createElement('canvas')
  result.width = width
  result.height = height
  const ctx = result.getContext('2d')!

  ctx.save()
  if (direction === 'horizontal') {
    ctx.translate(width, 0)
    ctx.scale(-1, 1)
  } else {
    ctx.translate(0, height)
    ctx.scale(1, -1)
  }
  ctx.drawImage(sourceCanvas, 0, 0)
  ctx.restore()

  return result
}

/**
 * Rotate a canvas by 90/180/270 degrees
 */
export function rotateCanvas(
  sourceCanvas: HTMLCanvasElement,
  angle: RotateAngle
): HTMLCanvasElement {
  const { width, height } = sourceCanvas
  const result = document.createElement('canvas')
  const ctx = result.getContext('2d')!

  if (angle === 90 || angle === 270) {
    result.width = height
    result.height = width
  } else {
    result.width = width
    result.height = height
  }

  ctx.save()
  ctx.translate(result.width / 2, result.height / 2)
  ctx.rotate((angle * Math.PI) / 180)
  ctx.drawImage(sourceCanvas, -width / 2, -height / 2)
  ctx.restore()

  return result
}

/**
 * Free rotation by arbitrary angle
 */
export function rotateFreeAngle(
  sourceCanvas: HTMLCanvasElement,
  angleDeg: number,
  backgroundColor: string = 'transparent'
): HTMLCanvasElement {
  const { width, height } = sourceCanvas
  const rad = (angleDeg * Math.PI) / 180
  const sin = Math.abs(Math.sin(rad))
  const cos = Math.abs(Math.cos(rad))
  const newW = Math.ceil(width * cos + height * sin)
  const newH = Math.ceil(width * sin + height * cos)

  const result = document.createElement('canvas')
  result.width = newW
  result.height = newH
  const ctx = result.getContext('2d')!

  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, newW, newH)
  }

  ctx.translate(newW / 2, newH / 2)
  ctx.rotate(rad)
  ctx.drawImage(sourceCanvas, -width / 2, -height / 2)

  return result
}
