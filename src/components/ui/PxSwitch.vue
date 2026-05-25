<template>
  <label class="px-switch" :class="{ disabled, active: modelValue }">
    <input
      type="checkbox"
      class="px-switch__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="onChange"
    />
    <span class="px-switch__track">
      <span class="px-switch__thumb" />
    </span>
    <span v-if="label" class="px-switch__label">{{ label }}</span>
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
.px-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.px-switch.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.px-switch__input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.px-switch__track {
  position: relative;
  width: 36px;
  height: 20px;
  background: var(--color-surface-strong);
  border: 1px solid var(--color-hairline-strong);
  border-radius: 10px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.px-switch.active .px-switch__track {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.px-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background: var(--color-surface-card);
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.px-switch.active .px-switch__thumb {
  transform: translateX(16px);
}

.px-switch:not(.disabled):hover .px-switch__track {
  border-color: var(--color-primary);
}

.px-switch__label {
  font-size: var(--text-sm);
  color: var(--color-body);
  line-height: 1;
}
</style>
