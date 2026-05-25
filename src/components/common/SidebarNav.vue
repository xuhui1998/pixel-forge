<template>
  <div class="sidebar-nav">
    <px-text class="sidebar-nav__title">{{ title }}</px-text>
    <nav class="sidebar-nav__list">
      <router-link
        v-for="item in items"
        :key="item.path"
        :to="item.path"
        class="sidebar-nav__item"
        :class="{ active: isActive(item.path) }"
      >
        <span class="sidebar-nav__icon"><component :is="item.icon" :size="14" /></span>
        <span class="sidebar-nav__label">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { type Component } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  title: string
  items: { path: string; label: string; icon: Component }[]
}>()

const route = useRoute()

function isActive(path: string): boolean {
  return route.path === path
}
</script>

<style scoped>
.sidebar-nav {
  width: var(--sidebar-width);
  flex-shrink: 0;
  border-right: 1px solid var(--color-hairline);
  background: var(--color-canvas);
  padding: var(--space-lg) var(--space-sm);
}

.sidebar-nav__title {
  font-size: 9px;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: var(--tracking-pixel);
  padding: var(--space-xs) var(--space-sm);
  margin-bottom: var(--space-xs);
}

.sidebar-nav__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-nav__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-sm);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-body);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.sidebar-nav__item:hover {
  color: var(--color-ink);
  background: var(--color-canvas-soft);
}

.sidebar-nav__item.active {
  color: var(--color-primary);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
}

.sidebar-nav__icon {
  font-size: var(--text-md);
  width: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .sidebar-nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-hairline);
    padding: var(--space-sm);
  }

  .sidebar-nav__list {
    flex-direction: row;
    overflow-x: auto;
    gap: var(--space-xxs);
  }

  .sidebar-nav__item {
    flex-shrink: 0;
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-sm);
  }
}
</style>
