<template>
  <div class="tool-layout">
    <!-- Horizontal Tab Bar -->
    <nav class="tool-tabs">
      <div class="tool-tabs__inner">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="tool-tab"
          :class="{ active: isActive(item.path) }"
        >
          <component :is="item.icon" :size="14" :stroke-width="1.5" />
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
    <!-- Full-height content area -->
    <div class="tool-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Scissors, Link2, Grid3x3 } from 'lucide-vue-next'

const route = useRoute()

function isActive(path: string): boolean {
  return route.path === path
}

const navItems = [
  { path: '/sprite/split', label: '拆帧 & GIF', icon: Scissors },
  { path: '/sprite/merge', label: '合并', icon: Link2 },
  { path: '/sprite/tilemap', label: 'TileMap', icon: Grid3x3 },
]
</script>

<style scoped>
.tool-layout {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--nav-height));
  background: var(--color-canvas);
}

.tool-tabs {
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-hairline);
  background: var(--color-surface-card);
  overflow-x: auto;
}

.tool-tabs__inner {
  display: flex;
  gap: 2px;
  padding: var(--space-xs) var(--space-lg);
  min-width: max-content;
}

.tool-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--space-sm) var(--space-base);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-body);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.tool-tab:hover {
  color: var(--color-ink);
  background: var(--color-canvas-soft);
}

.tool-tab.active {
  color: var(--color-primary);
  background: var(--color-canvas-soft);
  border: 1px solid var(--color-hairline);
}

.tool-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
