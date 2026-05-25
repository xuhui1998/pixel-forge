import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SpriteFrame } from '../types/sprite'

export const useSpriteStore = defineStore('sprite', () => {
  const sourceFile = ref<File | null>(null)
  const sourceUrl = ref('')
  const frames = ref<SpriteFrame[]>([])
  const currentFrameIndex = ref(0)
  const isPlaying = ref(false)
  const fps = ref(12)
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  function setFile(file: File) {
    if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
    sourceFile.value = file
    sourceUrl.value = URL.createObjectURL(file)
    frames.value = []
    currentFrameIndex.value = 0
    error.value = null
  }

  function setFrames(newFrames: SpriteFrame[]) {
    frames.value = newFrames
    currentFrameIndex.value = 0
  }

  function clear() {
    if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
    sourceFile.value = null
    sourceUrl.value = ''
    frames.value = []
    currentFrameIndex.value = 0
    isPlaying.value = false
    isProcessing.value = false
    error.value = null
  }

  return {
    sourceFile, sourceUrl, frames, currentFrameIndex,
    isPlaying, fps, isProcessing, error,
    setFile, setFrames, clear,
  }
})
