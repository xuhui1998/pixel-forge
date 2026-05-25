/* ═══════════════════════════════════════════════
   Pixel Outline / Stroke Algorithm
   ═══════════════════════════════════════════════ */

export interface OutlineOptions {
  color: [number, number, number, number] // RGBA
  width: number                          // outline width in pixels
  style: 'full' | 'inner' | 'outer'     // outline style
}

/**
 * Add pixel outline to sprite image.
 * Uses Manhattan distance for 45° diagonal edges (pixel art style).
 */
export function addPixelOutline(
  sourceCanvas: HTMLCanvasElement,
  options: OutlineOptions
): HTMLCanvasElement {
  const { width, height } = sourceCanvas
  const srcCtx = sourceCanvas.getContext('2d')!
  const srcData = srcCtx.getImageData(0, 0, width, height)
  const { data } = srcData

  const [or, og, ob, oa] = options.color
  const ow = options.width

  // Create opacity mask
  const opaque = new Uint8Array(width * height)
  for (let i = 0; i < width * height; i++) {
    opaque[i] = data[i * 4 + 3] > 0 ? 1 : 0
  }

  if (options.style === 'inner') {
    return drawInnerOutline(sourceCanvas, opaque, options)
  }

  // For full/outer: draw outline on a new canvas below the original
  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = width
  resultCanvas.height = height
  const resultCtx = resultCanvas.getContext('2d')!

  // Build outline mask
  const outlineMask = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (opaque[y * width + x]) continue // skip already opaque
      let isEdge = false
      for (let dy = -ow; dy <= ow && !isEdge; dy++) {
        for (let dx = -ow; dx <= ow && !isEdge; dx++) {
          if (Math.abs(dx) + Math.abs(dy) <= ow) {
            const nx = x + dx, ny = y + dy
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && opaque[ny * width + nx]) {
              isEdge = true
            }
          }
        }
      }
      if (isEdge) outlineMask[y * width + x] = 1
    }
  }

  // Draw outline pixels
  const resultData = resultCtx.createImageData(width, height)
  for (let i = 0; i < width * height; i++) {
    if (outlineMask[i]) {
      resultData.data[i * 4] = or
      resultData.data[i * 4 + 1] = og
      resultData.data[i * 4 + 2] = ob
      resultData.data[i * 4 + 3] = oa
    }
  }
  resultCtx.putImageData(resultData, 0, 0)

  // Draw original on top
  resultCtx.drawImage(sourceCanvas, 0, 0)
  return resultCanvas
}

function drawInnerOutline(
  sourceCanvas: HTMLCanvasElement,
  opaque: Uint8Array,
  options: OutlineOptions
): HTMLCanvasElement {
  const { width, height } = sourceCanvas
  const [or, og, ob, oa] = options.color
  const ow = options.width

  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = width
  resultCanvas.height = height
  const ctx = resultCanvas.getContext('2d')!
  ctx.drawImage(sourceCanvas, 0, 0)

  const resultData = ctx.getImageData(0, 0, width, height)

  // Find inner edge: opaque pixels near transparent area
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!opaque[y * width + x]) continue
      let isInnerEdge = false
      for (let dy = -ow; dy <= ow && !isInnerEdge; dy++) {
        for (let dx = -ow; dx <= ow && !isInnerEdge; dx++) {
          if (Math.abs(dx) + Math.abs(dy) <= ow) {
            const nx = x + dx, ny = y + dy
            if (nx < 0 || nx >= width || ny < 0 || ny >= height || !opaque[ny * width + nx]) {
              isInnerEdge = true
            }
          }
        }
      }
      if (isInnerEdge) {
        const i = (y * width + x) * 4
        resultData.data[i] = or
        resultData.data[i + 1] = og
        resultData.data[i + 2] = ob
        resultData.data[i + 3] = oa
      }
    }
  }

  ctx.putImageData(resultData, 0, 0)
  return resultCanvas
}
