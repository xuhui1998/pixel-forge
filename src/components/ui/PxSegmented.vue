<template>
  <div class="px-segmented">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="px-segmented__item"
      :class="{ active: modelValue === opt.value }"
      :disabled="disabled"
      @click="emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
export interface SegmentedOption {
  value: string | number
  label: string
}

withDefaults(defineProps<{
  modelValue: string | number
  options: SegmentedOption[]
  disabled?: boolean
}>(), {
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<style scoped>
.px-segmented {
  display: inline-flex;
  width: fit-content;
  gap: 2px;
  background: var(--color-canvas-soft);
  padding: 2px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-hairline);
}

.px-segmented__item {
  padding: 4px 12px;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--color-body);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.px-segmented__item:not(:disabled):hover {
  color: var(--color-ink);
  background: color-mix(in srgb, var(--color-surface-card) 60%, transparent);
}

.px-segmented__item.active {
  background: var(--color-surface-card);
  color: var(--color-ink);
  font-weight: var(--weight-medium);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.px-segmented__item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
