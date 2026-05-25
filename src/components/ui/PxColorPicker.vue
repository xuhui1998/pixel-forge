<template>
  <div class="px-color" :class="{ disabled }">
    <span class="px-color__preview" :style="{ background: modelValue }" @click="openPicker" />
    <input
      ref="inputRef"
      type="color"
      class="px-color__input"
      :value="modelValue"
      :disabled="disabled"
      @input="onInput"
    />
    <span v-if="showHex" class="px-color__hex">{{ modelValue }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  disabled?: boolean
  showHex?: boolean
}>(), {
  disabled: false,
  showHex: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputRef = ref<HTMLInputElement>()

function openPicker() {
  if (!props.disabled) inputRef.value?.click()
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<style scoped>
.px-color {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.px-color.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.px-color__preview {
  width: 32px;
  height: 28px;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 0.15s;
}

.px-color:not(.disabled) .px-color__preview:hover {
  border-color: var(--color-primary);
}

.px-color__input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.px-color__hex {
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  color: var(--color-muted);
}
</style>
