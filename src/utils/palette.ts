/* ═══════════════════════════════════════════════
   Palette Extraction & Mapping Utils
   ═══════════════════════════════════════════════ */

/* ── Types ── */

export interface PaletteColor {
  r: number
  g: number
  b: number
  hex: string
  count: number
  percentage: number
}

export interface PresetPalette {
  label: string
  colors: [number, number, number][]
}

export type DitherAlgorithm = 'none' | 'floyd-steinberg' | 'ordered' | 'atkinson'

export interface MapPaletteOptions {
  dither: DitherAlgorithm
  skipTransparent: boolean
}

/* ═══════════════════════════════════════════════
   Preset Palettes
   ═══════════════════════════════════════════════ */

export const PRESET_PALETTES: Record<string, PresetPalette> = {
  gameboy: {
    label: 'Game Boy (4色)',
    colors: [[15,56,15],[48,98,48],[139,172,15],[155,188,15]],
  },
  'gameboy-pocket': {
    label: 'Game Boy Pocket (4色)',
    colors: [[0,45,33],[12,83,68],[48,139,114],[126,191,160]],
  },
  pico8: {
    label: 'PICO-8 (16色)',
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
    label: 'CGA (16色)',
    colors: [
      [0,0,0],[0,0,170],[0,170,0],[0,170,170],
      [170,0,0],[170,0,170],[170,85,0],[170,170,170],
      [85,85,85],[85,85,255],[85,255,85],[85,255,255],
      [255,85,85],[255,85,255],[255,255,85],[255,255,255],
    ],
  },
  mono: {
    label: '黑白 (2色)',
    colors: [[0,0,0],[255,255,255]],
  },
  sepia: {
    label: '复古棕 (8色)',
    colors: [[30,20,10],[60,40,20],[100,70,40],[140,110,70],[180,150,100],[210,190,140],[235,220,190],[255,245,230]],
  },
  cyber: {
    label: '赛博朋克 (8色)',
    colors: [[10,0,20],[40,0,80],[120,0,180],[200,0,255],[255,0,120],[0,255,200],[0,200,255],[255,255,255]],
  },
  sweetie16: {
    label: 'Sweetie 16 (16色)',
    colors: [
      [27,27,34],[110,48,18],[252,148,4],[215,215,215],
      [148,210,206],[242,158,78],[244,98,34],[196,156,82],
      [30,120,88],[58,68,102],[172,44,60],[210,126,48],
      [255,255,255],[82,164,232],[200,108,224],[74,160,224],
    ],
  },
  endesga32: {
    label: 'Endesga 32 (32色)',
    colors: [
      [190,74,47],[215,118,67],[234,212,170],[226,172,99],
      [242,204,140],[108,190,83],[75,130,59],[25,60,51],
      [59,148,135],[51,172,120],[8,16,32],
      [16,20,40],[63,56,40],[104,80,60],[160,120,80],
      [212,172,106],[255,255,255],[200,200,200],[140,140,140],
      [100,100,100],[55,55,55],[0,0,0],[78,28,0],
      [140,20,0],[208,70,30],[255,140,60],[255,200,120],
      [0,128,56],[0,200,80],[0,255,130],[0,64,112],
      [0,100,180],[0,180,255],
    ],
  },
  reservoir: {
    label: 'Reservoir (10色)',
    colors: [
      [33,30,30],[54,46,46],[100,84,72],[149,130,104],
      [194,175,147],[232,219,199],[62,96,74],[100,152,108],
      [154,210,142],[208,238,192],
    ],
  },
  papes8: {
    label: 'Papes 8 (8色)',
    colors: [
      [28,8,16],[124,36,36],[220,180,100],[252,244,220],
      [60,100,100],[140,188,172],[200,220,200],[36,48,76],
    ],
  },
  grayscale4: {
    label: '灰度 (4色)',
    colors: [[0,0,0],[85,85,85],[170,170,170],[255,255,255]],
  },
  grayscale8: {
    label: '灰度 (8色)',
    colors: [[0,0,0],[36,36,36],[73,73,73],[109,109,109],[146,146,146],[182,182,182],[219,219,219],[255,255,255]],
  },
  aap64: {
    label: 'AAP-64 (64色)',
    colors: [
      [8,8,8],[20,12,28],[34,22,56],[60,30,80],[82,42,60],[106,58,60],[134,76,52],[160,102,56],
      [182,130,68],[202,160,86],[226,192,122],[246,224,168],[254,244,216],[40,44,44],[28,48,68],
      [32,68,100],[36,92,132],[44,120,148],[60,150,160],[84,178,164],[118,202,148],[158,222,136],
      [200,238,128],[236,250,140],[28,36,56],[22,58,92],[20,84,124],[22,114,148],[36,146,160],
      [62,178,156],[100,202,138],[144,222,122],[192,236,116],[236,248,132],[50,28,28],[68,30,42],
      [98,30,68],[134,34,84],[168,50,86],[198,78,78],[222,114,78],[242,154,88],[254,198,120],
      [254,234,166],[32,14,0],[52,22,0],[78,36,0],[110,56,0],[142,82,0],[174,112,0],
      [206,146,0],[234,184,2],[252,224,22],[254,248,98],[28,8,2],[50,12,2],[82,20,4],
      [120,34,4],[162,54,8],[202,82,12],[238,118,18],[254,162,40],[254,208,88],[254,244,158],
    ],
  },
}

/* ═══════════════════════════════════════════════
   Color helpers
   ═══════════════════════════════════════════════ */

function clamp(v: number, min = 0, max = 255) {
  return v < min ? min : v > max ? max : v
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
}

function rgbDist(a: [number,number,number], r: number, g: number, b: number) {
  const dr = a[0] - r, dg = a[1] - g, db = a[2] - b
  return dr*dr + dg*dg + db*db
}

/* ═══════════════════════════════════════════════
   Median-Cut Color Quantization
   ═══════════════════════════════════════════════ */

interface ColorBox {
  colors: number[][]
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
   Extract Palette
   ═══════════════════════════════════════════════ */

/**
 * Extract a palette from a canvas using Median Cut
 */
export function extractPalette(
  sourceCanvas: HTMLCanvasElement,
  maxColors: number = 16,
  options: { skipTransparent?: boolean; minAlpha?: number; sampleStep?: number } = {}
): PaletteColor[] {
  const { skipTransparent = true, minAlpha = 128, sampleStep } = options
  const ctx = sourceCanvas.getContext('2d')!
  const { data } = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)

  // Collect all valid pixels
  const pixels: number[][] = []
  const step = sampleStep ?? Math.max(1, Math.floor(data.length / 4 / 20000))
  let totalValid = 0

  for (let i = 0; i < data.length; i += step * 4) {
    if (skipTransparent && data[i + 3] < minAlpha) continue
    pixels.push([data[i], data[i + 1], data[i + 2]])
    totalValid++
  }

  if (pixels.length === 0) return []

  // Run Median Cut
  const extracted = medianCut(pixels, maxColors)

  // Count occurrences within tolerance
  const result: PaletteColor[] = extracted.map(([r, g, b]) => {
    let count = 0
    for (const p of pixels) {
      if (Math.abs(p[0] - r) < 32 && Math.abs(p[1] - g) < 32 && Math.abs(p[2] - b) < 32) {
        count++
      }
    }
    return {
      r, g, b,
      hex: rgbToHex(r, g, b),
      count,
      percentage: totalValid > 0 ? count / totalValid : 0,
    }
  })

  return result.sort((a, b) => b.count - a.count)
}

/**
 * Get all unique colors from canvas (for small color count images like pixel art)
 */
export function getUniqueColors(
  sourceCanvas: HTMLCanvasElement,
  options: { skipTransparent?: boolean; minAlpha?: number } = {}
): PaletteColor[] {
  const { skipTransparent = true, minAlpha = 128 } = options
  const ctx = sourceCanvas.getContext('2d')!
  const { data } = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)

  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>()
  let totalPixels = 0

  for (let i = 0; i < data.length; i += 4) {
    if (skipTransparent && data[i + 3] < minAlpha) continue
    totalPixels++
    const hex = rgbToHex(data[i], data[i + 1], data[i + 2])
    const existing = colorMap.get(hex)
    if (existing) {
      existing.count++
    } else {
      colorMap.set(hex, { r: data[i], g: data[i + 1], b: data[i + 2], count: 1 })
    }
  }

  const result: PaletteColor[] = []
  for (const [hex, { r, g, b, count }] of colorMap) {
    result.push({ r, g, b, hex, count, percentage: totalPixels > 0 ? count / totalPixels : 0 })
  }

  return result.sort((a, b) => b.count - a.count)
}

/* ═══════════════════════════════════════════════
   Find Nearest Palette Color
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
   Dithering Algorithms
   ═══════════════════════════════════════════════ */

// 4×4 Bayer matrix for ordered dithering
const BAYER4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
]

function applyNoDither(
  data: Uint8ClampedArray, w: number, h: number,
  palette: [number,number,number][]
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data.length)
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) {
      out[i] = 0; out[i+1] = 0; out[i+2] = 0; out[i+3] = 0
      continue
    }
    const idx = findNearest(palette, data[i], data[i+1], data[i+2])
    out[i]   = palette[idx][0]
    out[i+1] = palette[idx][1]
    out[i+2] = palette[idx][2]
    out[i+3] = data[i+3]
  }
  return out
}

function applyOrderedDither(
  data: Uint8ClampedArray, w: number, h: number,
  palette: [number,number,number][]
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data.length)
  const bayerSize = 4
  const spread = 48

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (data[i + 3] === 0) {
        out[i] = 0; out[i+1] = 0; out[i+2] = 0; out[i+3] = 0
        continue
      }
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

function applyFloydSteinberg(
  data: Uint8ClampedArray, w: number, h: number,
  palette: [number,number,number][]
): Uint8ClampedArray {
  const f = new Float32Array(data.length)
  for (let i = 0; i < data.length; i++) f[i] = data[i]

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (f[i+3] === 0) continue
      const or_ = f[i], og = f[i+1], ob = f[i+2]
      const idx = findNearest(palette, or_, og, ob)
      const nr = palette[idx][0], ng = palette[idx][1], nb = palette[idx][2]
      f[i] = nr; f[i+1] = ng; f[i+2] = nb

      const er = or_ - nr, eg = og - ng, eb = ob - nb
      const diffuse = (dx: number, dy: number, factor: number) => {
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
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

function applyAtkinson(
  data: Uint8ClampedArray, w: number, h: number,
  palette: [number,number,number][]
): Uint8ClampedArray {
  const f = new Float32Array(data.length)
  for (let i = 0; i < data.length; i++) f[i] = data[i]

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (f[i+3] === 0) continue
      const or_ = f[i], og = f[i+1], ob = f[i+2]
      const idx = findNearest(palette, or_, og, ob)
      const nr = palette[idx][0], ng = palette[idx][1], nb = palette[idx][2]
      f[i] = nr; f[i+1] = ng; f[i+2] = nb

      // Atkinson: diffuse 1/8 error to 6 neighbors
      const er = (or_ - nr) / 8
      const eg = (og - ng) / 8
      const eb = (ob - nb) / 8

      const targets = [[x+1,y],[x+2,y],[x-1,y+1],[x,y+1],[x+1,y+1],[x,y+2]]
      for (const [tx, ty] of targets) {
        if (tx >= 0 && tx < w && ty >= 0 && ty < h) {
          const j = (ty * w + tx) * 4
          f[j]   += er
          f[j+1] += eg
          f[j+2] += eb
        }
      }
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
   Map to Palette (Main Entry)
   ═══════════════════════════════════════════════ */

/**
 * Map image colors to a target palette
 */
export function mapToPalette(
  sourceCanvas: HTMLCanvasElement,
  palette: [number, number, number][],
  options: Partial<MapPaletteOptions> = {}
): HTMLCanvasElement {
  const { dither = 'none', skipTransparent = true } = options
  const { width, height } = sourceCanvas
  const ctx = sourceCanvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, width, height)

  // Zero out transparent pixels if skipTransparent
  if (skipTransparent) {
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 128) {
        imageData.data[i] = 0
      }
    }
  }

  let outputData: Uint8ClampedArray

  switch (dither) {
    case 'ordered':
      outputData = applyOrderedDither(imageData.data, width, height, palette)
      break
    case 'floyd-steinberg':
      outputData = applyFloydSteinberg(imageData.data, width, height, palette)
      break
    case 'atkinson':
      outputData = applyAtkinson(imageData.data, width, height, palette)
      break
    default:
      outputData = applyNoDither(imageData.data, width, height, palette)
  }

  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = width
  resultCanvas.height = height
  const resultCtx = resultCanvas.getContext('2d')!
  resultCtx.putImageData(new ImageData(new Uint8ClampedArray(outputData), width, height), 0, 0)

  return resultCanvas
}

/* ═══════════════════════════════════════════════
   Export Palette
   ═══════════════════════════════════════════════ */

export type PaletteExportFormat = 'gpl' | 'json' | 'txt' | 'hex'

/**
 * Export palette to various formats
 * - GPL: GIMP/Aseprite palette format
 * - JSON: structured JSON
 * - TXT: one hex per line
 * - HEX: comma-separated hex string
 */
export function exportPalette(
  palette: PaletteColor[],
  format: PaletteExportFormat = 'gpl',
  name: string = 'PixelForge Export'
): string {
  switch (format) {
    case 'gpl':
      return [
        'GIMP Palette',
        `Name: ${name}`,
        `Columns: ${Math.min(palette.length, 8)}`,
        '#',
        ...palette.map(c => `${String(c.r).padStart(3)}\t${String(c.g).padStart(3)}\t${String(c.b).padStart(3)}\t${c.hex}`),
      ].join('\n')

    case 'json':
      return JSON.stringify(palette.map(c => ({
        r: c.r, g: c.g, b: c.b,
        hex: c.hex,
        percentage: Math.round(c.percentage * 10000) / 100 + '%',
      })), null, 2)

    case 'txt':
      return palette.map(c => c.hex).join('\n')

    case 'hex':
      return palette.map(c => c.hex).join(', ')
  }
}

/**
 * Trigger download of palette file
 */
export function downloadPalette(
  palette: PaletteColor[],
  format: PaletteExportFormat = 'gpl',
  filename: string = 'palette'
) {
  const content = exportPalette(palette, format, filename)
  const ext = format === 'gpl' ? 'gpl' : format === 'json' ? 'json' : 'txt'
  const mime = format === 'json' ? 'application/json' : 'text/plain'

  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
