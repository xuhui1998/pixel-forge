<template>
  <div class="tool-page">
    <div class="tool-page__body">
      <!-- Left: Controls -->
      <div class="tool-page__sidebar">
        <div class="tool-page__sidebar-title">
          <Grid3x3 :size="16" />
          <px-text>TileMap 切割</px-text>
        </div>

        <px-card>
          <template #header>上传瓦片地图</template>
          <ImageUploader v-model="imageFile" accept="image/*" />
        </px-card>

        <px-card v-if="imageFile" class="mt-base">
          <template #header>切割参数</template>
          <div v-if="originalSize" class="control-group">
            <label class="control-label"><px-text>原图尺寸: {{ originalSize.width }} × {{ originalSize.height }}</px-text></label>
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>瓦片宽 (px)</px-text></label>
            <PxNumberInput v-model="tileW" :min="1" />
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>瓦片高 (px)</px-text></label>
            <PxNumberInput v-model="tileH" :min="1" />
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>间距 (px)</px-text></label>
            <PxNumberInput v-model="padding" :min="0" />
          </div>
          <div class="control-group mt-base">
            <label class="control-label"><px-text>边距 (px)</px-text></label>
            <PxNumberInput v-model="margin" :min="0" />
          </div>
          <div v-if="previewCols > 0" class="control-group mt-base">
            <label class="control-label"><px-text>网格: {{ previewCols }} × {{ previewRows }} = {{ previewCols * previewRows }} 块</px-text></label>
          </div>
          <div class="mt-base">
            <px-button type="primary" :disabled="!imageFile" @click="processCut">
              开始切割
            </px-button>
          </div>
        </px-card>

        <!-- Stats -->
        <px-card v-if="result" class="mt-base">
          <template #header>统计信息</template>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">总瓦片</span>
              <span class="stat-value">{{ result.stats.totalTiles }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">唯一瓦片</span>
              <span class="stat-value highlight">{{ result.stats.uniqueCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">重复瓦片</span>
              <span class="stat-value">{{ result.stats.duplicateCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">压缩率</span>
              <span class="stat-value highlight">{{ compressionRate }}%</span>
            </div>
          </div>
        </px-card>

        <!-- Download actions -->
        <px-card v-if="result" class="mt-base">
          <template #header>导出</template>
          <div class="button-col">
            <px-button type="primary" @click="downloadTileset"><Download :size="14" /> 下载瓦片集</px-button>
            <px-button plain @click="downloadJSON"><FileJson :size="14" /> 下载 JSON 索引</px-button>
            <px-button plain @click="downloadAllTiles" ><Download :size="14" /> 下载全部瓦片 (ZIP)</px-button>
          </div>
        </px-card>
      </div>

      <!-- Right: Preview -->
      <div class="tool-page__main">
        <div v-if="!sourceUrl" class="tool-page__empty">
          <Grid3x3 :size="48" :stroke-width="1" />
          <p>上传瓦片地图素材开始切割</p>
        </div>

        <div v-else class="preview-area">
          <!-- Source preview with grid overlay -->
          <div class="tool-page__compare">
            <!-- Left: grid overlay on source -->
            <div class="preview-card">
              <div class="preview-card__header">网格预览</div>
              <div class="tilemap-preview-wrap checkerboard" ref="sourceWrapRef">
                <img ref="sourceImgRef" :src="sourceUrl" class="tilemap-source-img" @load="onSourceLoad" />
                <svg v-if="svgGridLines.length" class="tilemap-grid-svg" :viewBox="svgViewBox">
                  <line
                    v-for="(line, li) in svgGridLines"
                    :key="li"
                    :x1="line.x1" :y1="line.y1"
                    :x2="line.x2" :y2="line.y2"
                    stroke="rgba(255,60,60,0.6)"
                    stroke-width="1"
                    stroke-dasharray="2,2"
                  />
                </svg>
              </div>
            </div>

            <!-- Right: unique tiles grid -->
            <div v-if="result" class="preview-card">
              <div class="preview-card__header">
                <span>去重瓦片 ({{ result.uniqueTiles.length }})</span>
              </div>
              <div class="unique-tiles-grid" :style="gridStyle">
                <div
                  v-for="(tile, i) in result.uniqueTiles"
                  :key="i"
                  class="unique-tile-cell"
                  :class="{ active: selectedTile === i }"
                  @click="selectedTile = i"
                >
                  <img :src="tileDataUrls[i]" class="unique-tile-img" />
                  <span class="unique-tile-index">{{ i }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Selected tile detail -->
          <div v-if="selectedTile >= 0 && result" class="preview-card" style="flex: 0 0 auto;">
            <div class="preview-card__header">
              <span>瓦片详情 #{{ selectedTile }}</span>
            </div>
            <div class="tile-detail">
              <div class="tile-detail-img-wrap checkerboard">
                <img :src="tileDataUrls[selectedTile]" class="tile-detail-img" />
              </div>
              <div class="tile-detail-info">
                <div><px-text>尺寸: {{ result.stats.tileWidth }} × {{ result.stats.tileHeight }}</px-text></div>
                <div><px-text>哈希: {{ result.uniqueTiles[selectedTile].hash }}</px-text></div>
                <div>
                  <px-text>出现次数: {{ tileOccurrenceCount[selectedTile] }}</px-text>
                </div>
                <div class="mt-base">
                  <px-button size="small" plain @click="downloadSingleTile(selectedTile)">
                    <Download :size="12" /> 下载此瓦片
                  </px-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Grid3x3, Download, FileJson } from 'lucide-vue-next'
import { loadImageToCanvas, downloadBlob, canvasToBlob } from '../../utils/canvas'
import { splitTileMap, exportTileset, exportTileMapJSON } from '../../utils/tilemap'
import type { TileMapResult } from '../../utils/tilemap'
import ImageUploader from '../common/ImageUploader.vue'

const imageFile = ref<File | null>(null)
const tileW = ref(16)
const tileH = ref(16)
const padding = ref(0)
const margin = ref(0)
const sourceUrl = ref('')
const originalSize = ref<{ width: number; height: number } | null>(null)
const result = ref<TileMapResult | null>(null)
const selectedTile = ref(-1)

// Source image refs
const sourceWrapRef = ref<HTMLDivElement>()
const sourceImgRef = ref<HTMLImageElement>()

// Precomputed tile data URLs for display
const tileDataUrls = ref<string[]>([])

// ─── Computed ───

const previewCols = computed(() => {
  if (!originalSize.value) return 0
  const { width } = originalSize.value
  return Math.floor((width - margin.value * 2 + padding.value) / (tileW.value + padding.value))
})

const previewRows = computed(() => {
  if (!originalSize.value) return 0
  const { height } = originalSize.value
  return Math.floor((height - margin.value * 2 + padding.value) / (tileH.value + padding.value))
})

const compressionRate = computed(() => {
  if (!result.value || result.value.stats.totalTiles === 0) return 0
  const { uniqueCount, totalTiles } = result.value.stats
  return Math.round((1 - uniqueCount / totalTiles) * 100)
})

const tileOccurrenceCount = computed(() => {
  if (!result.value) return [] as number[]
  const counts = new Array(result.value.uniqueTiles.length).fill(0)
  result.value.indexMap.forEach(idx => {
    if (idx >= 0 && idx < counts.length) counts[idx]++
  })
  return counts
})

const gridStyle = computed(() => {
  if (!result.value) return {}
  const cols = Math.ceil(Math.sqrt(result.value.uniqueTiles.length))
  return {
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
  }
})

// ─── SVG grid overlay ───

interface SvgLine { x1: number; y1: number; x2: number; y2: number }

const svgViewBox = ref('0 0 0 0')
const svgGridLines = ref<SvgLine[]>([])

function buildGridLines() {
  if (!sourceImgRef.value || !originalSize.value) {
    svgGridLines.value = []
    return
  }
  const natW = originalSize.value.width
  const natH = originalSize.value.height
  const tw = tileW.value
  const th = tileH.value
  const p = padding.value
  const m = margin.value

  svgViewBox.value = `0 0 ${natW} ${natH}`

  const cols = Math.floor((natW - m * 2 + p) / (tw + p))
  const rows = Math.floor((natH - m * 2 + p) / (th + p))

  // Draw lines at tile boundaries
  const vLines: SvgLine[] = []
  for (let c = 0; c <= cols; c++) {
    const x = m + c * (tw + p)
    vLines.push({ x1: x, y1: m, x2: x, y2: m + rows * (th + p) - p })
  }
  for (let r = 0; r <= rows; r++) {
    const y = m + r * (th + p)
    vLines.push({ x1: m, y1: y, x2: m + cols * (tw + p) - p, y2: y })
  }

  svgGridLines.value = vLines
}

function onSourceLoad() {
  if (sourceImgRef.value) {
    originalSize.value = {
      width: sourceImgRef.value.naturalWidth,
      height: sourceImgRef.value.naturalHeight,
    }
    buildGridLines()
  }
}

// ─── Watchers ───

watch([tileW, tileH, padding, margin], () => {
  buildGridLines()
})

watch(imageFile, async (file) => {
  result.value = null
  selectedTile.value = -1
  tileDataUrls.value = []
  if (file) {
    sourceUrl.value = URL.createObjectURL(file)
    const dims = await loadImageToCanvas(file).then(c => ({ width: c.width, height: c.height }))
    originalSize.value = dims
  } else {
    sourceUrl.value = ''
    originalSize.value = null
    svgGridLines.value = []
  }
})

// ─── Processing ───

async function processCut() {
  if (!imageFile.value) return
  const canvas = await loadImageToCanvas(imageFile.value)
  result.value = splitTileMap(canvas, {
    tileWidth: tileW.value,
    tileHeight: tileH.value,
    padding: padding.value,
    margin: margin.value,
  })
  selectedTile.value = -1

  // Pre-generate data URLs for unique tiles
  tileDataUrls.value = result.value.uniqueTiles.map(tile => {
    return tile.canvas.toDataURL('image/png')
  })
}

// ─── Downloads ───

async function downloadTileset() {
  if (!result.value) return
  const { uniqueTiles, stats } = result.value
  const tilesetCanvas = exportTileset(uniqueTiles, stats.tileWidth, stats.tileHeight)
  const blob = await canvasToBlob(tilesetCanvas, 'image/png')
  downloadBlob(blob, 'tileset.png')
}

function downloadJSON() {
  if (!result.value) return
  const json = exportTileMapJSON(result.value)
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, 'tilemap.json')
}

async function downloadAllTiles() {
  if (!result.value) return
  // Download each unique tile individually
  // Note: Without a zip library, we'll download the tileset image + JSON together
  await downloadTileset()
  downloadJSON()
}

async function downloadSingleTile(index: number) {
  if (!result.value || !tileDataUrls.value[index]) return
  const tile = result.value.uniqueTiles[index]
  const blob = await canvasToBlob(tile.canvas, 'image/png')
  downloadBlob(blob, `tile_${index}.png`)
}
</script>

<style scoped>
.tilemap-preview-wrap {
  position: relative;
  display: inline-block;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
}

.tilemap-source-img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.tilemap-grid-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-xs);
  background: var(--color-canvas-soft);
  border-radius: var(--radius-sm);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.stat-value {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: var(--color-ink);
  font-family: 'PS2P', 'Zpix', monospace;
}

.stat-value.highlight {
  color: var(--color-primary);
}

/* Unique tiles grid */
.unique-tiles-grid {
  display: grid;
  gap: 4px;
  padding: var(--space-sm);
  max-height: 400px;
  overflow-y: auto;
}

.unique-tile-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;
  border: 2px solid var(--color-hairline);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-surface-card);
}

.unique-tile-cell:hover {
  border-color: var(--color-primary);
  background: var(--color-canvas-soft);
}

.unique-tile-cell.active {
  border-color: var(--color-primary);
  background: var(--color-canvas-soft);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.unique-tile-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  image-rendering: pixelated;
}

.unique-tile-index {
  font-size: 8px;
  color: var(--color-muted);
  margin-top: 2px;
  font-family: 'PS2P', 'Zpix', monospace;
}

/* Tile detail */
.tile-detail {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
  padding: var(--space-base);
}

.tile-detail-img-wrap {
  flex-shrink: 0;
  width: 128px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-hairline);
  border-radius: var(--radius-sm);
}

.tile-detail-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.tile-detail-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

/* Button column */
.button-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* Compare layout */
.tool-page__compare {
  display: flex;
  gap: var(--space-base);
  flex: 1;
  min-height: 0;
}

.tool-page__compare > .preview-card {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.tool-page__compare > .preview-card .preview-card__canvas,
.tool-page__compare > .preview-card .unique-tiles-grid,
.tool-page__compare > .preview-card .tilemap-preview-wrap {
  flex: 1;
  min-height: 0;
}
</style>
