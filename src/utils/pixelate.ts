/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */

export type DitherMode = 'none' | 'ordered' | 'floyd-steinberg'

export interface PixelateOptions {
  pixelSize: number
  colorCount: number        // 2 – 256
  dither: DitherMode
  grayscale: boolean
  palette: [number, number, number][] | null   // custom palette (RGB tuples)
}

const DEFAULT_OPTIONS: PixelateOptions = {
  pixelSize: 8,
  colorCount: 256,
  dither: 'none',
  grayscale: false,
  palette: null,
}

/* ═══════════════════════════════════════════════
   Preset Palettes
   ═══════════════════════════════════════════════ */

export const PALETTES: Record<string, { label: string; colors: [number, number, number][] }> = {
  none:    { label: '自动',       colors: [] },
  gameboy: {
    label: 'Game Boy',
    colors: [[15,56,15],[48,98,48],[139,172,15],[155,188,15]],
  },
  pico8: {
    label: 'PICO-8',
    colors: [
      [0,0,0],[29,43,83],[126,37,83],[0,135,81],
      [171,82,54],[95,87,79],[194,195,199],[255,241,232],
      [255,0,77],[255,163,0],[255,236,39],[0,228,54],
      [41,173,255],[131,118,156],[255,119,168],[255,204,170],
    ],
  },
  nes: {
    label: 'NES (54色)',
    colors: [
      [124,124,124],[0,0,252],[0,0,188],[68,40,188],
      [148,0,132],[168,0,32],[168,16,0],[136,20,0],
      [80,48,0],[0,120,0],[0,104,0],[0,88,0],
      [0,64,88],[0,0,0],[252,252,252],[0,120,248],
      [0,88,248],[104,68,252],[216,0,204],[228,0,88],
      [248,56,0],[228,92,16],[172,124,0],[0,184,0],
      [0,168,0],[0,168,68],[0,136,136],[56,56,56],
      [252,252,252],[60,188,252],[104,136,252],[152,120,248],
      [248,120,248],[248,88,152],[248,120,88],[252,160,68],
      [248,184,0],[184,248,24],[88,216,84],[88,248,152],
      [0,232,216],[120,120,120],[252,252,252],[164,228,252],
      [184,184,248],[216,184,248],[248,184,248],[248,164,192],
      [240,208,176],[252,224,168],[248,216,120],[216,248,120],
      [184,248,184],[184,248,216],[0,252,252],[216,216,216],
    ],
  },
  cga: {
    label: 'CGA',
    colors: [
      [0,0,0],[0,0,170],[0,170,0],[0,170,170],
      [170,0,0],[170,0,170],[170,85,0],[170,170,170],
      [85,85,85],[85,85,255],[85,255,85],[85,255,255],
      [255,85,85],[255,85,255],[255,255,85],[255,255,255],
    ],
  },
  mono: {
    label: '黑白',
    colors: [[0,0,0],[255,255,255]],
  },
  sepia: {
    label: '复古棕',
    colors: [[30,20,10],[60,40,20],[100,70,40],[140,110,70],[180,150,100],[210,190,140],[235,220,190],[255,245,230]],
  },
  cyber: {
    label: '赛博朋克',
    colors: [[10,0,20],[40,0,80],[120,0,180],[200,0,255],[255,0,120],[0,255,200],[0,200,255],[255,255,255]],
  },
}

/* ═══════════════════════════════════════════════
   Color helpers
   ═══════════════════════════════════════════════ */

function clamp(v: number, min = 0, max = 255) {
  return v < min ? min : v > max ? max : v
}

function rgbDist(a: [number,number,number], r: number, g: number, b: number) {
  const dr = a[0] - r, dg = a[1] - g, db = a[2] - b
  return dr*dr + dg*dg + db*db
}

function toGray(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/* ═══════════════════════════════════════════════
   Median-Cut color quantization
   ═══════════════════════════════════════════════ */

interface ColorBox {
  colors: number[][]   // [r,g,b] arrays
  rMin: number; rMax: number
  gMin: number; gMax: number
  bMin: number; bMax: number
}

function makeBox(colors: number[][]): ColorBox {
  let rMin=255, rMax=0, gMin=255, gMax=0, bMin=255, bMax=0
  for (const c of colors) {
    if (c[0]<rMin) rMin=c[0]; if (c[0]>rMax) rMax=c[0]
    if (c[1]<gMin) gMin=c[1]; if (c[1]>gMax) gMax=c[1]
    if (c[2]<bMin) bMin=c[2]; if (c[2]>bMax) bMax=c[2]
  }
  return { colors, rMin, rMax, gMin, gMax, bMin, bMax }
}

function boxVolume(box: ColorBox) {
  return (box.rMax - box.rMin + 1) * (box.gMax - box.gMin + 1) * (box.bMax - box.bMin + 1)
}

function boxAverage(box: ColorBox): [number, number, number] {
  const n = box.colors.length
  let sr = 0, sg = 0, sb = 0
  for (const c of box.colors) { sr += c[0]; sg += c[1]; sb += c[2] }
  return [Math.round(sr/n), Math.round(sg/n), Math.round(sb/n)]
}

function medianCut(pixels: number[][], maxColors: number): [number, number, number][] {
  if (pixels.length === 0) return [[0,0,0]]
  if (maxColors <= 1) return [boxAverage(makeBox(pixels))]

  let boxes: ColorBox[] = [makeBox(pixels)]

  while (boxes.length < maxColors) {
    // Find the box with the largest volume to split
    let bestIdx = -1
    let bestVol = -1
    for (let i = 0; i < boxes.length; i++) {
      const vol = boxVolume(boxes[i])
      if (vol > bestVol && boxes[i].colors.length > 1) {
        bestVol = vol
        bestIdx = i
      }
    }
    if (bestIdx === -1) break

    const box = boxes[bestIdx]
    const rRange = box.rMax - box.rMin
    const gRange = box.gMax - box.gMin
    const bRange = box.bMax - box.bMin

    // Sort along the longest axis
    let sortKey: (c: number[]) => number
    if (rRange >= gRange && rRange >= bRange) sortKey = c => c[0]
    else if (gRange >= rRange && gRange >= bRange) sortKey = c => c[1]
    else sortKey = c => c[2]

    box.colors.sort((a, b) => sortKey(a) - sortKey(b))
    const mid = box.colors.length >> 1

    const left = makeBox(box.colors.slice(0, mid))
    const right = makeBox(box.colors.slice(mid))
    boxes.splice(bestIdx, 1, left, right)
  }

  return boxes.map(boxAverage)
}

/* ═══════════════════════════════════════════════
   Find nearest palette color
   ═══════════════════════════════════════════════ */

function findNearest(palette: [number,number,number][], r: number, g: number, b: number): number {
  let bestIdx = 0
  let bestDist = Infinity
  for (let i = 0; i < palette.length; i++) {
    const d = rgbDist(palette[i], r, g, b)
    if (d < bestDist) { bestDist = d; bestIdx = i }
  }
  return bestIdx
}

/* ═══════════════════════════════════════════════
   Dithering
   ═══════════════════════════════════════════════ */

// 4×4 Bayer matrix for ordered dithering
const BAYER4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
]

function orderedDither(
  data: Uint8ClampedArray, w: number, h: number,
  palette: [number,number,number][]
) {
  const out = new Uint8ClampedArray(data.length)
  const bayerSize = 4
  const spread = 32   // threshold spread

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const threshold = (BAYER4[y % bayerSize][x % bayerSize] / 16 - 0.5) * spread
      const r = clamp(data[i]   + threshold)
      const g = clamp(data[i+1] + threshold)
      const b = clamp(data[i+2] + threshold)
      const idx = findNearest(palette, r, g, b)
      out[i]   = palette[idx][0]
      out[i+1] = palette[idx][1]
      out[i+2] = palette[idx][2]
      out[i+3] = data[i+3]
    }
  }
  return out
}

function floydSteinberg(
  data: Uint8ClampedArray, w: number, h: number,
  palette: [number,number,number][]
) {
  // Work on a float copy
  const f = new Float32Array(data.length)
  for (let i = 0; i < data.length; i++) f[i] = data[i]

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const or_ = f[i], og = f[i+1], ob = f[i+2]
      const idx = findNearest(palette, or_, og, ob)
      const nr = palette[idx][0], ng = palette[idx][1], nb = palette[idx][2]
      f[i] = nr; f[i+1] = ng; f[i+2] = nb

      const er = or_ - nr, eg = og - ng, eb = ob - nb

      const diffuse = (dx: number, dy: number, factor: number) => {
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && nx < w && ny < h) {
          const j = (ny * w + nx) * 4
          f[j]   += er * factor
          f[j+1] += eg * factor
          f[j+2] += eb * factor
        }
      }
      diffuse(1, 0, 7/16)
      diffuse(-1, 1, 3/16)
      diffuse(0, 1, 5/16)
      diffuse(1, 1, 1/16)
    }
  }

  const out = new Uint8ClampedArray(data.length)
  for (let i = 0; i < f.length; i += 4) {
    out[i]   = clamp(Math.round(f[i]))
    out[i+1] = clamp(Math.round(f[i+1]))
    out[i+2] = clamp(Math.round(f[i+2]))
    out[i+3] = clamp(Math.round(f[i+3]))
  }
  return out
}

/* ═══════════════════════════════════════════════
   Main pixelate function (enhanced)
   ═══════════════════════════════════════════════ */

export function pixelate(
  sourceCanvas: HTMLCanvasElement,
  opts: Partial<PixelateOptions> = {}
): HTMLCanvasElement {
  const options = { ...DEFAULT_OPTIONS, ...opts }
  const { width, height } = sourceCanvas

  // ── Step 1: shrink to low resolution ──
  const smallW = Math.max(1, Math.ceil(width / options.pixelSize))
  const smallH = Math.max(1, Math.ceil(height / options.pixelSize))
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')!
  tempCanvas.width = smallW
  tempCanvas.height = smallH
  tempCtx.drawImage(sourceCanvas, 0, 0, smallW, smallH)

  const imgData = tempCtx.getImageData(0, 0, smallW, smallH)
  let { data } = imgData

  // ── Step 2: grayscale ──
  if (options.grayscale) {
    for (let i = 0; i < data.length; i += 4) {
      const g = toGray(data[i], data[i+1], data[i+2])
      data[i] = data[i+1] = data[i+2] = g
    }
  }

  // ── Step 3: build palette ──
  let palette: [number, number, number][] = options.palette!
  if (!palette || palette.length === 0) {
    if (options.colorCount >= 256 && !options.grayscale) {
      // No quantization needed
      palette = null!
    } else {
      // Sample unique colors for median-cut (limit to ~10000 samples for speed)
      const allPixels: number[][] = []
      const step = Math.max(1, Math.floor(data.length / 4 / 10000))
      for (let i = 0; i < data.length; i += step * 4) {
        allPixels.push([data[i], data[i+1], data[i+2]])
      }
      palette = medianCut(allPixels, options.colorCount)
    }
  }

  // ── Step 4: quantize + dither ──
  if (palette) {
    if (options.dither === 'ordered') {
      data = orderedDither(data, smallW, smallH, palette)
    } else if (options.dither === 'floyd-steinberg') {
      data = floydSteinberg(data, smallW, smallH, palette)
    } else {
      // No dither – nearest color
      for (let i = 0; i < data.length; i += 4) {
        const idx = findNearest(palette, data[i], data[i+1], data[i+2])
        data[i]   = palette[idx][0]
        data[i+1] = palette[idx][1]
        data[i+2] = palette[idx][2]
      }
    }
    tempCtx.putImageData(new ImageData(data, smallW, smallH), 0, 0)
  }

  // ── Step 5: enlarge back with nearest-neighbor ──
  const resultCanvas = document.createElement('canvas')
  const resultCtx = resultCanvas.getContext('2d')!
  resultCanvas.width = width
  resultCanvas.height = height
  resultCtx.imageSmoothingEnabled = false
  resultCtx.drawImage(tempCanvas, 0, 0, width, height)

  return resultCanvas
}

/* ═══════════════════════════════════════════════
   Extract palette colors from canvas (for preview)
   ═══════════════════════════════════════════════ */

export function extractPalette(canvas: HTMLCanvasElement, maxColors: number): [number, number, number][] {
  const ctx = canvas.getContext('2d')!
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels: number[][] = []
  const step = Math.max(1, Math.floor(data.length / 4 / 5000))
  for (let i = 0; i < data.length; i += step * 4) {
    pixels.push([data[i], data[i+1], data[i+2]])
  }
  return medianCut(pixels, maxColors)
}
