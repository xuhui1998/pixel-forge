<template>
  <div class="uploader" :class="{ 'uploader--dragover': isDragover, 'uploader--has-file': hasFile }" @click="triggerInput" @dragover.prevent="isDragover = true" @dragleave.prevent="isDragover = false" @drop.prevent="handleDrop">
    <input ref="fileInput" type="file" :accept="accept" class="sr-only" @change="handleInput" />
    <div v-if="!hasFile" class="uploader__placeholder">
      <span class="uploader__icon"><ImagePlus :size="32" :stroke-width="1.5" /></span>
      <span class="uploader__text">拖放图片到此处或点击上传</span>
      <span class="uploader__hint">支持 {{ acceptLabel }}</span>
    </div>
    <div v-else class="uploader__preview">
      <img :src="previewUrl" alt="预览" class="uploader__img pixel-render" />
      <button class="uploader__remove" @click.stop="removeFile">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ImagePlus } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  accept?: string
  modelValue?: File | null
}>(), {
  accept: 'image/png,image/jpeg,image/webp,image/gif,image/bmp',
  modelValue: null,
})

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const internalFile = ref<File | null>(null)
const previewUrl = ref('')

const hasFile = computed(() => !!internalFile.value)
const acceptLabel = computed(() => props.accept.replace(/image\//g, '').toUpperCase())

function triggerInput() {
  fileInput.value?.click()
}

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    setFile(target.files[0])
  }
}

function handleDrop(e: DragEvent) {
  isDragover.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

function setFile(file: File) {
  internalFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  emit('update:modelValue', file)
}

function removeFile() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  internalFile.value = null
  previewUrl.value = ''
  emit('update:modelValue', null)
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<style scoped>
.uploader {
  background: var(--color-surface-card);
  border: 2px dashed var(--color-hairline-strong);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.uploader:hover,
.uploader--dragover {
  border-color: var(--color-primary);
  background: var(--color-canvas-soft);
}

.uploader__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xl);
  text-align: center;
}

.uploader__icon {
  color: var(--color-muted-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}

.uploader__text {
  font-family: var(--font-pixel);
  font-size: var(--text-xs);
  color: var(--color-ink);
}

.uploader__hint {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.uploader__preview {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-base);
}

.uploader__img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.uploader__remove {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-xs);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-ink);
  color: var(--color-canvas);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.uploader__preview:hover .uploader__remove {
  opacity: 1;
}
</style>
