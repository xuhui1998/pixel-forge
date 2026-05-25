<template>
  <div class="px-slider" :class="{ disabled }">
    <input
      ref="inputRef"
      type="range"
      class="px-slider__input"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      @input="onInput"
    />
    <div class="px-slider__track">
      <div class="px-slider__fill" :style="{ width: percent + '%' }" />
      <div class="px-slider__thumb" :style="{ left: percent + '%' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const inputRef = ref<HTMLInputElement>()

const percent = computed(() => {
  const range = props.max - props.min
  if (range === 0) return 0
  return ((props.modelValue - props.min) / range) * 100
})

function onInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  emit('update:modelValue', val)
}
</script>

<style scoped>
.px-slider {
  position: relative;
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
}

.px-slider.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.px-slider__input {
  position: absolute;
  width: 100%;
  height: 20px;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
  margin: 0;
}

.px-slider.disabled .px-slider__input {
  cursor: not-allowed;
}

.px-slider__track {
  position: relative;
  width: 100%;
  height: 6px;
  background: var(--color-surface-strong);
  border-radius: 3px;
  overflow: visible;
}

.px-slider__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.05s linear;
}

.px-slider__thumb {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background: var(--color-surface-card);
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
  pointer-events: none;
}

.px-slider__input:hover ~ .px-slider__track .px-slider__thumb {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.px-slider__input:active ~ .px-slider__track .px-slider__thumb {
  transform: translate(-50%, -50%) scale(1.15);
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--color-primary) 20%, transparent);
}
</style>
