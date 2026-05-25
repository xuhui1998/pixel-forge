<template>
  <div class="canvas-preview" :class="{ 'canvas-preview--fill': fill }">
    <div class="canvas-preview__header">
      <px-text class="canvas-preview__label">{{ label }}</px-text>
      <span v-if="dimensions" class="canvas-preview__dims">{{ dimensions }}</span>
    </div>
    <div class="canvas-preview__canvas-wrapper" ref="wrapperRef">
      <canvas ref="canvasRef" class="canvas-preview__canvas pixel-render" :width="canvasW" :height="canvasH" />
      <div v-if="!src" class="canvas-preview__empty">
        <span>暂无预览</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  src?: string
  label?: string
  width?: number
  height?: number
  fill?: boolean
}>(), {
  label: '预览',
  width: 400,
  height: 300,
  fill: false,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapperRef = ref<HTMLDivElement | null>(null)
const dimensions = ref('')
const canvasW = ref(props.width)
const canvasH = ref(props.height)

let resizeObserver: ResizeObserver | null = null

function updateCanvasSize() {
  if (!props.fill || !wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  const w = Math.floor(rect.width)
  const h = Math.floor(rect.height)
  if (w > 0 && h > 0) {
    canvasW.value = w
    canvasH.value = h
    nextTick(() => {
      drawImage(props.src)
    })
  }
}

function drawImage(src: string | undefined) {
  if (!canvasRef.value || !src) return
  const ctx = canvasRef.value.getContext('2d')!
  const img = new Image()
  img.onload = () => {
    if (!canvasRef.value) return
    const maxW = canvasRef.value.width
    const maxH = canvasRef.value.height
    const scale = Math.min(maxW / img.width, maxH / img.height, 1)
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)
    const x = Math.round((maxW - w) / 2)
    const y = Math.round((maxH - h) / 2)
    ctx.clearRect(0, 0, maxW, maxH)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(img, x, y, w, h)
    dimensions.value = `${img.width} × ${img.height}`
  }
  img.src = src
}

watch(() => props.src, (val) => {
  if (val) drawImage(val)
  else {
    const ctx = canvasRef.value?.getContext('2d')
    if (ctx && canvasRef.value) ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    dimensions.value = ''
  }
})

onMounted(() => {
  if (props.fill && wrapperRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateCanvasSize()
    })
    resizeObserver.observe(wrapperRef.value)
    updateCanvasSize()
  }
  if (props.src) drawImage(props.src)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

defineExpose({ canvasRef })
</script>

<style scoped>
.canvas-preview {
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.canvas-preview--fill {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.canvas-preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-base);
  border-bottom: 1px solid var(--color-hairline-soft);
  flex-shrink: 0;
}

.canvas-preview__label {
  font-size: 9px;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

.canvas-preview__dims {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.canvas-preview__canvas-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: repeating-conic-gradient(var(--color-canvas-soft) 0% 25%, var(--color-canvas) 0% 50%) 0 0 / 16px 16px;
  min-height: 200px;
}

.canvas-preview--fill .canvas-preview__canvas-wrapper {
  flex: 1;
  min-height: 0;
}

.canvas-preview__canvas {
  max-width: 100%;
  max-height: 400px;
}

.canvas-preview--fill .canvas-preview__canvas {
  max-width: 100%;
  max-height: none;
  width: 100%;
  height: 100%;
}

.canvas-preview__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted-soft);
  font-size: var(--text-sm);
}
</style>
