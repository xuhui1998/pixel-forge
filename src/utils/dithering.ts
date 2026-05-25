/* ═══════════════════════════════════════════════
   Dithering Algorithms
   ═══════════════════════════════════════════════ */

export type DitherAlgorithm = 'none' | 'floyd-steinberg' | 'ordered' | 'atkinson'

export interface DitherOptions {
  algorithm: DitherAlgorithm
  palette: [number, number, number][]
  bayerMatrixSize?: 4 | 8
}

/* ── Helper: find nearest palette color ── */
function findNearest(r: number, g: number, b: number, palette: [number, number, number][]): [number, number, number] {
  let minDist = Infinity
  let nearest = palette[0]
  for (const c of palette) {
    const d = (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2
    if (d < minDist) { minDist = d; nearest = c }
  }
  return nearest
}

/* ── Floyd-Steinberg Dithering ── */
function floydSteinberg(
  imageData: ImageData,
  palette: [number, number, number][]
): ImageData {
  const { width, height } = imageData
  const pixels = new Float32Array(width * height * 3)
  for (let i = 0; i < imageData.data.length; i += 4) {
    pixels[i] = imageData.data[i]
    pixels[i + 1] = imageData.data[i + 1]
    pixels[i + 2] = imageData.data[i + 2]
  }

  const idx = (x: number, y: number) => (y * width + x) * 3

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = idx(x, y)
      const oldR = pixels[i], oldG = pixels[i + 1], oldB = pixels[i + 2]
      const [newR, newG, newB] = findNearest(oldR, oldG, oldB, palette)
      pixels[i] = newR; pixels[i + 1] = newG; pixels[i + 2] = newB

      const errR = oldR - newR, errG = oldG - newG, errB = oldB - newB
      const spread: [number, number, number][] = [
        [x + 1, y, 7 / 16],
        [x - 1, y + 1, 3 / 16],
        [x, y + 1, 5 / 16],
        [x + 1, y + 1, 1 / 16],
      ]
      for (const [sx, sy, w] of spread) {
        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
          const si = idx(sx, sy)
          pixels[si] += errR * w
          pixels[si + 1] += errG * w
          pixels[si + 2] += errB * w
        }
      }
    }
  }

  const result = new ImageData(width, height)
  for (let i = 0; i < pixels.length; i += 3) {
    const pi = (i / 3) * 4
    result.data[pi] = Math.round(Math.max(0, Math.min(255, pixels[i])))
    result.data[pi + 1] = Math.round(Math.max(0, Math.min(255, pixels[i + 1])))
    result.data[pi + 2] = Math.round(Math.max(0, Math.min(255, pixels[i + 2])))
    result.data[pi + 3] = imageData.data[pi + 3]
  }
  return result
}

/* ── Ordered (Bayer) Dithering ── */
function orderedDither(
  imageData: ImageData,
  palette: [number, number, number][],
  matrixSize: 4 | 8 = 4
): ImageData {
  const bayer4: number[][] = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ]
  // 8x8 Bayer matrix
  const bayer8: number[][] = [
    [0, 48, 12, 60, 3, 51, 15, 63],
    [32, 16, 44, 28, 35, 19, 47, 31],
    [8, 56, 4, 52, 11, 59, 7, 55],
    [40, 24, 36, 20, 43, 27, 39, 23],
    [2, 50, 14, 62, 1, 49, 13, 61],
    [34, 18, 46, 30, 33, 17, 45, 29],
    [10, 58, 6, 54, 9, 57, 5, 53],
    [42, 26, 38, 22, 41, 25, 37, 21],
  ]
  const matrix = matrixSize === 8 ? bayer8 : bayer4
  const divisor = matrixSize === 8 ? 64 : 16

  const { width, height, data } = imageData
  const result = new ImageData(new Uint8ClampedArray(data), width, height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const threshold = (matrix[y % matrixSize][x % matrixSize] / divisor - 0.5) * 64
      const r = Math.max(0, Math.min(255, data[i] + threshold))
      const g = Math.max(0, Math.min(255, data[i + 1] + threshold))
      const b = Math.max(0, Math.min(255, data[i + 2] + threshold))
      const [nr, ng, nb] = findNearest(r, g, b, palette)
      result.data[i] = nr; result.data[i + 1] = ng; result.data[i + 2] = nb
    }
  }
  return result
}

/* ── Atkinson Dithering ── */
function atkinsonDither(
  imageData: ImageData,
  palette: [number, number, number][]
): ImageData {
  const { width, height } = imageData
  const pixels = new Float32Array(width * height * 3)
  for (let i = 0; i < imageData.data.length; i += 4) {
    pixels[i] = imageData.data[i]
    pixels[i + 1] = imageData.data[i + 1]
    pixels[i + 2] = imageData.data[i + 2]
  }

  const idx = (x: number, y: number) => (y * width + x) * 3

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = idx(x, y)
      const oldR = pixels[i], oldG = pixels[i + 1], oldB = pixels[i + 2]
      const [newR, newG, newB] = findNearest(oldR, oldG, oldB, palette)
      pixels[i] = newR; pixels[i + 1] = newG; pixels[i + 2] = newB

      const errR = (oldR - newR) / 8
      const errG = (oldG - newG) / 8
      const errB = (oldB - newB) / 8

      const targets: [number, number][] = [
        [x + 1, y], [x + 2, y],
        [x - 1, y + 1], [x, y + 1], [x + 1, y + 1],
        [x, y + 2],
      ]
      for (const [tx, ty] of targets) {
        if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
          const ti = idx(tx, ty)
          pixels[ti] += errR; pixels[ti + 1] += errG; pixels[ti + 2] += errB
        }
      }
    }
  }

  const result = new ImageData(width, height)
  for (let i = 0; i < pixels.length; i += 3) {
    const pi = (i / 3) * 4
    result.data[pi] = Math.round(Math.max(0, Math.min(255, pixels[i])))
    result.data[pi + 1] = Math.round(Math.max(0, Math.min(255, pixels[i + 1])))
    result.data[pi + 2] = Math.round(Math.max(0, Math.min(255, pixels[i + 2])))
    result.data[pi + 3] = imageData.data[pi + 3]
  }
  return result
}

/* ── Main: Apply dithering to canvas ── */
export function applyDither(
  sourceCanvas: HTMLCanvasElement,
  options: DitherOptions
): HTMLCanvasElement {
  const ctx = sourceCanvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)

  let result: ImageData
  switch (options.algorithm) {
    case 'floyd-steinberg':
      result = floydSteinberg(imageData, options.palette)
      break
    case 'ordered':
      result = orderedDither(imageData, options.palette, options.bayerMatrixSize ?? 4)
      break
    case 'atkinson':
      result = atkinsonDither(imageData, options.palette)
      break
    case 'none':
    default:
      // Simple nearest-color mapping (no dithering)
      result = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height)
      for (let i = 0; i < result.data.length; i += 4) {
        if (result.data[i + 3] === 0) continue
        const [nr, ng, nb] = findNearest(result.data[i], result.data[i + 1], result.data[i + 2], options.palette)
        result.data[i] = nr; result.data[i + 1] = ng; result.data[i + 2] = nb
      }
      break
  }

  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = sourceCanvas.width
  resultCanvas.height = sourceCanvas.height
  resultCanvas.getContext('2d')!.putImageData(result, 0, 0)
  return resultCanvas
}
