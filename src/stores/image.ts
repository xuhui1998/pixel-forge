import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImageStore = defineStore('image', () => {
  const originalFile = ref<File | null>(null)
  const originalUrl = ref('')
  const processedUrl = ref('')
  const processedBlob = ref<Blob | null>(null)
  const isProcessing = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  function setFile(file: File) {
    if (originalUrl.value) {
      URL.revokeObjectURL(originalUrl.value)
    }
    if (processedUrl.value) {
      URL.revokeObjectURL(processedUrl.value)
      processedUrl.value = ''
      processedBlob.value = null
    }
    originalFile.value = file
    originalUrl.value = URL.createObjectURL(file)
    error.value = null
  }

  function setProcessed(blob: Blob) {
    if (processedUrl.value) {
      URL.revokeObjectURL(processedUrl.value)
    }
    processedBlob.value = blob
    processedUrl.value = URL.createObjectURL(blob)
  }

  function clearProcessed() {
    if (processedUrl.value) {
      URL.revokeObjectURL(processedUrl.value)
    }
    processedUrl.value = ''
    processedBlob.value = null
  }

  function clear() {
    if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
    if (processedUrl.value) URL.revokeObjectURL(processedUrl.value)
    originalFile.value = null
    originalUrl.value = ''
    processedUrl.value = ''
    processedBlob.value = null
    isProcessing.value = false
    progress.value = 0
    error.value = null
  }

  return {
    originalFile, originalUrl, processedUrl, processedBlob,
    isProcessing, progress, error,
    setFile, setProcessed, clearProcessed, clear,
  }
})
