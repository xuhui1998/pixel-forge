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
import { Grid3x3, RefreshCw, Download, Ruler, Palette, Scissors, Bot, SwatchBook, Blend, PenTool, FlipHorizontal, Layers, Grid2x2, Square, Files, Type } from 'lucide-vue-next'

const route = useRoute()

function isActive(path: string): boolean {
  return route.path === path
}

const navItems = [
  { path: '/image/pixelate', label: '像素化', icon: Grid3x3 },
  { path: '/image/format', label: '格式转换', icon: RefreshCw },
  { path: '/image/compress', label: '图片压缩', icon: Download },
  { path: '/image/resize', label: '调整尺寸', icon: Ruler },
  { path: '/image/color-replace', label: '颜色替换', icon: Palette },
  { path: '/image/bg-remove', label: '去除背景', icon: Scissors },
  { path: '/image/cutout', label: 'AI 抠图', icon: Bot },
  { path: '/image/palette', label: '调色板', icon: SwatchBook },
  { path: '/image/dithering', label: '抖动处理', icon: Blend },
  { path: '/image/outline', label: '像素描边', icon: PenTool },
  { path: '/image/mirror-flip', label: '镜像翻转', icon: FlipHorizontal },
  { path: '/image/composite', label: '图片叠加', icon: Layers },
  { path: '/image/nine-slice', label: '九宫格切图', icon: Grid2x2 },
  { path: '/image/mosaic', label: '马赛克打码', icon: Square },
  { path: '/image/batch', label: '批量处理', icon: Files },
  { path: '/image/watermark', label: '水印添加', icon: Type },
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
