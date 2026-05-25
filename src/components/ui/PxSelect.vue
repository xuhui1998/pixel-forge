<template>
  <div class="px-select" :class="{ disabled, open: isOpen }" ref="wrapperRef">
    <button
      type="button"
      class="px-select__trigger"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="px-select__value">{{ currentLabel }}</span>
      <svg class="px-select__arrow" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <Transition name="px-select-dropdown">
      <div v-if="isOpen" class="px-select__dropdown">
        <div
          v-for="opt in options"
          :key="opt.value"
          class="px-select__option"
          :class="{ active: modelValue === opt.value }"
          @click="select(opt.value)"
        >
          {{ opt.label }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export interface SelectOption {
  value: string | number
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string | number
  options: SelectOption[]
  disabled?: boolean
  placeholder?: string
}>(), {
  disabled: false,
  placeholder: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const isOpen = ref(false)
const wrapperRef = ref<HTMLDivElement>()

const currentLabel = computed(() => {
  const opt = props.options.find(o => o.value === props.modelValue)
  return opt ? opt.label : props.placeholder || ''
})

function toggle() {
  if (!props.disabled) isOpen.value = !isOpen.value
}

function select(val: string | number) {
  emit('update:modelValue', val)
  isOpen.value = false
}

function onClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.px-select {
  position: relative;
  width: 100%;
}

.px-select.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.px-select__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  min-height: 30px;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--color-ink);
  cursor: pointer;
  transition: border-color 0.15s;
  gap: 6px;
}

.px-select:not(.disabled) .px-select__trigger:hover {
  border-color: var(--color-primary);
}

.px-select.open .px-select__trigger {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.px-select__value {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.px-select__arrow {
  width: 12px;
  height: 12px;
  color: var(--color-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.px-select.open .px-select__arrow {
  transform: rotate(180deg);
}

.px-select__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  max-height: 200px;
  overflow-y: auto;
  padding: 2px;
}

.px-select__option {
  padding: 6px 10px;
  font-size: var(--text-sm);
  color: var(--color-body);
  cursor: pointer;
  border-radius: var(--radius-xs);
  transition: all 0.1s ease;
}

.px-select__option:hover {
  background: var(--color-canvas-soft);
  color: var(--color-ink);
}

.px-select__option.active {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

/* Transition */
.px-select-dropdown-enter-active,
.px-select-dropdown-leave-active {
  transition: all 0.15s ease;
}
.px-select-dropdown-enter-from,
.px-select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
