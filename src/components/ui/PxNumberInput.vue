<template>
  <div class="px-number" :class="{ disabled }">
    <button type="button" class="px-number__btn" :disabled="disabled || modelValue <= min" @click="decrement">
      <svg viewBox="0 0 12 12" fill="none"><path d="M2.5 6H9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
    </button>
    <input
      type="text"
      class="px-number__input"
      :value="modelValue"
      :disabled="disabled"
      @change="onManualChange"
      @blur="onManualChange"
      @keydown.enter="onManualChange"
    />
    <button type="button" class="px-number__btn" :disabled="disabled || modelValue >= max" @click="increment">
      <svg viewBox="0 0 12 12" fill="none"><path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}>(), {
  min: -Infinity,
  max: Infinity,
  step: 1,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

function clamp(val: number) {
  return Math.min(props.max, Math.max(props.min, val))
}

function increment() {
  emit('update:modelValue', clamp(props.modelValue + props.step))
}

function decrement() {
  emit('update:modelValue', clamp(props.modelValue - props.step))
}

function onManualChange(e: Event) {
  const raw = Number((e.target as HTMLInputElement).value)
  if (!isNaN(raw)) {
    emit('update:modelValue', clamp(raw))
  }
}
</script>

<style scoped>
.px-number {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sm);
  background: var(--color-surface-card);
  overflow: hidden;
  transition: border-color 0.15s;
}

.px-number:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.px-number.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.px-number__btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  transition: all 0.1s;
  flex-shrink: 0;
}

.px-number__btn svg {
  width: 12px;
  height: 12px;
}

.px-number__btn:not(:disabled):hover {
  background: var(--color-canvas-soft);
  color: var(--color-primary);
}

.px-number__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.px-number__input {
  width: 52px;
  height: 28px;
  text-align: center;
  border: none;
  border-left: 1px solid var(--color-hairline);
  border-right: 1px solid var(--color-hairline);
  background: transparent;
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  color: var(--color-ink);
  outline: none;
  padding: 0 4px;
}

.px-number__input::-webkit-inner-spin-button,
.px-number__input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Hide the text input spinners in Firefox */
.px-number__input {
  -moz-appearance: textfield;
}
</style>
