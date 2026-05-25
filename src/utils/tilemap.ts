/**
 * TileMap utilities - split tilemap / tileset into individual tiles, deduplicate, and export
 */

export interface TileInfo {
  index: number              // 瓦片在原图中的位置索引
  canvas: HTMLCanvasElement  // 瓦片 Canvas
  hash: string               // 像素级哈希（用于去重）
  offsetX: number            // 在原图中的 X 偏移
  offsetY: number            // 在原图中的 Y 偏移
  col: number                // 列号
  row: number                // 行号
}

export interface TileMapResult {
  /** 所有切割出的瓦片（含重复） */
  allTiles: TileInfo[]
  /** 去重后的唯一瓦片 */
  uniqueTiles: TileInfo[]
  /** 瓦片索引映射表：allTiles[i] → uniqueTiles 中的索引 */
  indexMap: number[]
  /** 统计信息 */
  stats: {
    totalTiles: number
    uniqueCount: number
    duplicateCount: number
    tileWidth: number
    tileHeight: number
    columns: number
    rows: number
  }
}

export interface TileMapSplitOptions {
  tileWidth: number
  tileHeight: number
  padding?: number   // 瓦片间距（px），默认 0
  margin?: number    // 外边距（px），默认 0
}

/**
 * 切割瓦片地图
 * 按指定瓦片尺寸将整张 tileset 图均匀切割
 */
export function splitTileMap(
  sourceCanvas: HTMLCanvasElement,
  options: TileMapSplitOptions
): TileMapResult {
  const { tileWidth, tileHeight, padding = 0, margin = 0 } = options
  const { width, height } = sourceCanvas

  const cols = Math.floor((width - margin * 2 + padding) / (tileWidth + padding))
  const rows = Math.floor((height - margin * 2 + padding) / (tileHeight + padding))

  const allTiles: TileInfo[] = []
  const hashToUniqueIndex = new Map<string, number>()
  const uniqueTiles: TileInfo[] = []
  const indexMap: number[] = []
  let uniqueIdx = 0

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = margin + col * (tileWidth + padding)
      const offsetY = margin + row * (tileHeight + padding)

      if (offsetX + tileWidth > width || offsetY + tileHeight > height) continue

      const tileCanvas = document.createElement('canvas')
      tileCanvas.width = tileWidth
      tileCanvas.height = tileHeight
      const ctx = tileCanvas.getContext('2d')!
      ctx.drawImage(sourceCanvas, offsetX, offsetY, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight)

      const hash = computeTileHash(tileCanvas)
      const flatIndex = allTiles.length

      const tile: TileInfo = {
        index: flatIndex,
        canvas: tileCanvas,
        hash,
        offsetX,
        offsetY,
        col,
        row,
      }

      allTiles.push(tile)

      // 去重
      if (!hashToUniqueIndex.has(hash)) {
        hashToUniqueIndex.set(hash, uniqueIdx)
        uniqueTiles.push(tile)
        indexMap.push(uniqueIdx)
        uniqueIdx++
      } else {
        indexMap.push(hashToUniqueIndex.get(hash)!)
      }
    }
  }

  return {
    allTiles,
    uniqueTiles,
    indexMap,
    stats: {
      totalTiles: allTiles.length,
      uniqueCount: uniqueTiles.length,
      duplicateCount: allTiles.length - uniqueTiles.length,
      tileWidth,
      tileHeight,
      columns: cols,
      rows,
    },
  }
}

/**
 * 计算瓦片的像素级哈希（FNV-1a）
 * 用于判断两个瓦片是否完全相同（快速去重）
 */
function computeTileHash(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  let hash = 2166136261 // FNV offset basis
  for (let i = 0; i < data.length; i += 4) {
    hash ^= data[i]
    hash = (hash * 16777619) >>> 0
    hash ^= data[i + 1]
    hash = (hash * 16777619) >>> 0
    hash ^= data[i + 2]
    hash = (hash * 16777619) >>> 0
    hash ^= data[i + 3]
    hash = (hash * 16777619) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

/**
 * 导出瓦片集为单张精灵图（去重后）
 */
export function exportTileset(
  uniqueTiles: TileInfo[],
  tileWidth: number,
  tileHeight: number,
  options: { columns?: number; padding?: number } = {}
): HTMLCanvasElement {
  const { columns, padding = 0 } = options
  const cols = columns ?? Math.ceil(Math.sqrt(uniqueTiles.length))
  const rows = Math.ceil(uniqueTiles.length / cols)

  const canvas = document.createElement('canvas')
  canvas.width = cols * (tileWidth + padding) - padding
  canvas.height = rows * (tileHeight + padding) - padding
  const ctx = canvas.getContext('2d')!

  uniqueTiles.forEach((tile, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    ctx.drawImage(tile.canvas, col * (tileWidth + padding), row * (tileHeight + padding))
  })

  return canvas
}

/**
 * 导出瓦片索引为 JSON 数据
 * 可用于游戏引擎还原地图
 */
export function exportTileMapJSON(
  result: TileMapResult,
  options: { mapName?: string } = {}
): string {
  const { columns, rows } = result.stats

  // 构建 2D 地图数组（值为 uniqueTiles 中的索引）
  const map: number[][] = []
  for (let r = 0; r < rows; r++) {
    const row: number[] = []
    for (let c = 0; c < columns; c++) {
      const idx = r * columns + c
      row.push(idx < result.indexMap.length ? result.indexMap[idx] : -1)
    }
    map.push(row)
  }

  return JSON.stringify({
    name: options.mapName || 'TileMap',
    tileWidth: result.stats.tileWidth,
    tileHeight: result.stats.tileHeight,
    columns: result.stats.columns,
    rows: result.stats.rows,
    uniqueTileCount: result.stats.uniqueCount,
    totalTiles: result.stats.totalTiles,
    map,
  }, null, 2)
}
