<template>
  <label class="px-checkbox" :class="{ disabled, checked: modelValue }">
    <input
      type="checkbox"
      class="px-checkbox__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="onChange"
    />
    <span class="px-checkbox__box">
      <svg class="px-checkbox__icon" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
    <span v-if="label" class="px-checkbox__label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  label?: string
  disabled?: boolean
}>(), {
  label: '',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).checked)
}
</script>

<style scoped>
.px-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.px-checkbox.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.px-checkbox__input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.px-checkbox__box {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--color-hairline-strong);
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
  background: var(--color-surface-card);
}

.px-checkbox.checked .px-checkbox__box {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.px-checkbox:not(.disabled):hover .px-checkbox__box {
  border-color: var(--color-primary);
}

.px-checkbox__icon {
  width: 12px;
  height: 12px;
  color: var(--color-on-primary);
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.15s ease;
}

.px-checkbox.checked .px-checkbox__icon {
  opacity: 1;
  transform: scale(1);
}

.px-checkbox__label {
  font-size: var(--text-sm);
  color: var(--color-body);
  line-height: 1;
}
</style>
