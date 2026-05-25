<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero__layout">
          <!-- Left: Text Content -->
          <div class="hero__content">
            <span class="hero__badge"><Wrench :size="14" /> 浏览器端 · 隐私安全 · 免费开源</span>
            <px-text tag="h1" class="hero__title" :size="36">像素风格图片处理<br />& 精灵图工具工坊</px-text>
            <p class="hero__desc">像素化、格式转换、压缩、AI抠图、精灵图拆帧合并、GIF导出 — 所有处理均在浏览器本地完成，无需上传服务器。</p>
            <div class="hero__actions">
              <px-button type="primary" size="large" @click="$router.push('/image')">
                <Image :size="14" /> 图片处理工具
              </px-button>
              <px-button plain size="large" class="hero__btn-sprite" @click="$router.push('/sprite')">
                <Film :size="14" /> 精灵图工具
              </px-button>
            </div>
          </div>

          <!-- Right: Mac Window Mockup -->
          <div class="hero__window">
            <div class="mac-window">
              <!-- Title Bar -->
              <div class="mac-titlebar">
                <div class="mac-dots">
                  <span class="mac-dot mac-dot--red"></span>
                  <span class="mac-dot mac-dot--yellow"></span>
                  <span class="mac-dot mac-dot--green"></span>
                </div>
                <div class="mac-titlebar__text">PixelForge</div>
                <div class="mac-titlebar__spacer"></div>
              </div>

              <!-- Toolbar -->
              <div class="mac-toolbar">
                <div class="mac-toolbar__search">
                  <Search :size="13" />
                  <span>搜索工具…</span>
                </div>
              </div>

              <!-- Content Area -->
              <div class="mac-body">
                <!-- Sidebar -->
                <div class="mac-sidebar">
                  <div class="mac-sidebar__section">
                    <div class="mac-sidebar__title">图片处理</div>
                    <div
                      v-for="tool in sidebarImageTools"
                      :key="tool.name"
                      class="mac-sidebar__item"
                      :class="{ 'mac-sidebar__item--active': tool.active }"
                      @click="$router.push(tool.path)"
                    >
                      <component :is="tool.icon" :size="14" />
                      <span>{{ tool.name }}</span>
                    </div>
                  </div>
                  <div class="mac-sidebar__section">
                    <div class="mac-sidebar__title">精灵图</div>
                    <div
                      v-for="tool in sidebarSpriteTools"
                      :key="tool.name"
                      class="mac-sidebar__item"
                      @click="$router.push(tool.path)"
                    >
                      <component :is="tool.icon" :size="14" />
                      <span>{{ tool.name }}</span>
                    </div>
                  </div>
                </div>

                <!-- Main Area -->
                <div class="mac-main">
                  <div class="mac-canvas">
                    <div class="mac-canvas__icon">
                      <Grid3x3 :size="32" :stroke-width="1.5" />
                    </div>
                    <div class="mac-canvas__label">像素化预览</div>
                    <!-- Pixel grid mockup -->
                    <div class="mac-pixel-grid">
                      <div
                        v-for="(color, i) in pixelColors"
                        :key="i"
                        class="mac-pixel"
                        :style="{ background: color }"
                      ></div>
                    </div>
                  </div>
                  <div class="mac-panel">
                    <div class="mac-panel__row">
                      <span class="mac-panel__label">像素大小</span>
                      <span class="mac-panel__value">8px</span>
                    </div>
                    <div class="mac-panel__row">
                      <span class="mac-panel__label">输出格式</span>
                      <span class="mac-panel__value">PNG</span>
                    </div>
                    <div class="mac-panel__row mac-panel__row--btn">
                      <px-button type="primary" size="small">下载图片</px-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Floating badges -->
            <div class="float-badge float-badge--green">
              <Shield :size="14" /> 本地处理
            </div>
            <div class="float-badge float-badge--orange">
              <Zap :size="14" /> 秒级完成
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="section features">
      <div class="container">
        <h2 class="section-title"><px-text :size="28">功能模块</px-text></h2>
        <p class="section-subtitle">两大核心模块，覆盖像素风格图片处理和精灵图工作流</p>
        <div class="grid grid-2 gap-lg">
          <!-- Image Processing Card -->
          <div class="card card-hover feature-card" @click="$router.push('/image')">
            <div class="feature-card__header">
              <div class="feature-card__icon-wrap feature-card__icon-wrap--image">
                <Image :size="24" :stroke-width="1.5" />
              </div>
              <ArrowRight :size="16" class="feature-card__arrow" />
            </div>
            <h3 class="feature-card__title">
              <px-text :size="16" bold>图片处理</px-text>
            </h3>
            <p class="feature-card__desc">7 大图片处理功能，涵盖像素化、格式转换、压缩、缩放、颜色替换、去背景、AI抠图</p>
            <div class="feature-card__tags">
              <span class="tag">像素化</span>
              <span class="tag">格式转换</span>
              <span class="tag">压缩</span>
              <span class="tag">AI抠图</span>
            </div>
          </div>

          <!-- Sprite Sheet Card -->
          <div class="card card-hover feature-card" @click="$router.push('/sprite')">
            <div class="feature-card__header">
              <div class="feature-card__icon-wrap feature-card__icon-wrap--sprite">
                <Film :size="24" :stroke-width="1.5" />
              </div>
              <ArrowRight :size="16" class="feature-card__arrow" />
            </div>
            <h3 class="feature-card__title">
              <px-text :size="16" bold>精灵图处理</px-text>
            </h3>
            <p class="feature-card__desc">精灵图拆帧与合并，支持 GIF 动画导出，像素游戏开发必备工具</p>
            <div class="feature-card__tags">
              <span class="tag">拆帧</span>
              <span class="tag">合并</span>
              <span class="tag">预览</span>
              <span class="tag">GIF导出</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tool Grid Section -->
    <section class="section tools-section">
      <div class="container">
        <h2 class="section-title"><px-text :size="28">全部工具</px-text></h2>
        <p class="section-subtitle">点击即可使用，所有工具均在浏览器本地运行</p>
        <div class="grid grid-4 gap-md">
          <div
            v-for="feat in imageFeatures"
            :key="feat.name"
            class="card card-hover mini-card"
            @click="$router.push(feat.path)"
          >
            <span class="mini-card__icon"><component :is="feat.icon" :size="24" :stroke-width="1.5" /></span>
            <px-text class="mini-card__name" :size="12" bold>{{ feat.name }}</px-text>
            <span class="mini-card__desc">{{ feat.desc }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Highlights Section -->
    <section class="section highlights-section">
      <div class="container">
        <div class="grid grid-4 gap-md">
          <div v-for="hl in highlights" :key="hl.title" class="highlight-card">
            <div class="highlight-card__icon"><component :is="hl.icon" :size="22" :stroke-width="1.5" /></div>
            <h4 class="highlight-card__title">
              <px-text :size="14" bold>{{ hl.title }}</px-text>
            </h4>
            <p class="highlight-card__desc">{{ hl.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  Grid3x3, RefreshCw, Download, Ruler, Palette, Scissors, Bot,
  Image, Film, Wrench, ArrowRight, Shield, Zap, Globe, Layers, Search, Link2
} from 'lucide-vue-next'

const sidebarImageTools = [
  { icon: Grid3x3, name: '像素化', path: '/image/pixelate', active: true },
  { icon: RefreshCw, name: '格式转换', path: '/image/format' },
  { icon: Download, name: '图片压缩', path: '/image/compress' },
  { icon: Ruler, name: '调整尺寸', path: '/image/resize' },
  { icon: Palette, name: '颜色替换', path: '/image/color-replace' },
  { icon: Scissors, name: '去除背景', path: '/image/bg-remove' },
  { icon: Bot, name: 'AI 抠图', path: '/image/cutout' },
]

const sidebarSpriteTools = [
  { icon: Layers, name: '拆帧 & GIF', path: '/sprite/split' },
  { icon: Link2, name: '精灵图合并', path: '/sprite/merge' },
]

const pixelColors = [
  '#f54e00', '#cf2d56', '#c08532', '#1f8a65', '#4a90d9',
  '#7e14ff', '#f54e00', '#c08532', '#1f8a65', '#4a90d9',
  '#26251e', '#5a5852', '#807d72', '#c08532', '#f54e00',
  '#1f8a65', '#4a90d9', '#7e14ff', '#cf2d56', '#26251e',
  '#f54e00', '#1f8a65', '#c08532', '#4a90d9', '#7e14ff',
]

const imageFeatures = [
  { icon: Grid3x3, name: '像素化', path: '/image/pixelate', desc: '将图片转换为像素风格' },
  { icon: RefreshCw, name: '格式转换', path: '/image/format', desc: '支持 PNG、JPG、WebP 等格式互转' },
  { icon: Download, name: '图片压缩', path: '/image/compress', desc: '压缩图片体积，保持画质' },
  { icon: Ruler, name: '调整尺寸', path: '/image/resize', desc: '自定义宽高，等比缩放' },
  { icon: Palette, name: '颜色替换', path: '/image/color-replace', desc: '精准替换图片中的指定颜色' },
  { icon: Scissors, name: '去除背景', path: '/image/bg-remove', desc: '一键移除图片背景' },
  { icon: Bot, name: 'AI 抠图', path: '/image/cutout', desc: '浏览器本地 AI 智能抠图' },
]

const highlights = [
  { icon: Shield, title: '隐私安全', desc: '所有处理在浏览器本地完成，文件不会上传到任何服务器' },
  { icon: Zap, title: '高效快速', desc: '基于 WebAssembly 和 Canvas API，秒级完成图片处理' },
  { icon: Globe, title: '跨平台', desc: '支持所有现代浏览器，无需安装任何软件' },
  { icon: Wrench, title: '完全免费', desc: '所有功能永久免费使用，持续更新维护' },
]
</script>

<style scoped>
.home {
  flex: 1;
}

/* ── Hero ── */
.hero {
  padding: var(--space-xxl) 0 var(--space-section);
  background: var(--color-canvas);
  overflow: hidden;
}

.hero__layout {
  display: flex;
  align-items: center;
  gap: var(--space-xxl);
}

/* Left content */
.hero__content {
  flex: 0 0 420px;
  max-width: 420px;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-body);
  background: var(--color-surface-strong);
  border-radius: var(--radius-pill);
  margin-bottom: var(--space-lg);
}

.hero__title {
  color: var(--color-ink);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--space-base);
  line-height: var(--leading-tight);
}

.hero__desc {
  font-size: var(--text-md);
  color: var(--color-body);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-xl);
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: var(--space-base);
  flex-wrap: wrap;
}

.hero__btn-sprite {
  --px-button-text-color: var(--color-ink) !important;
  --px-bg-color: var(--color-surface-card) !important;
  --px-border-color: var(--color-hairline-strong) !important;
  --px-button-bg-shadow-color: var(--color-surface-card) !important;
}

.hero__btn-sprite:hover {
  --px-button-text-color: var(--color-on-primary) !important;
  --px-bg-color: var(--color-primary) !important;
  --px-border-color: var(--color-primary) !important;
  --px-button-bg-shadow-color: var(--color-primary) !important;
}

/* dark mode handled by global overrides in style.css */

/* ── Right: Mac Window ── */
.hero__window {
  flex: 1;
  position: relative;
  min-width: 0;
}

.mac-window {
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 24px 48px rgba(0, 0, 0, 0.04);
  transform: perspective(1200px) rotateY(-3deg) rotateX(1deg);
  transition: transform 0.4s ease;
}

.mac-window:hover {
  transform: perspective(1200px) rotateY(-1deg) rotateX(0.5deg);
}

/* Title Bar */
.mac-titlebar {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 14px;
  background: var(--color-surface-card);
  border-bottom: 1px solid var(--color-hairline);
  user-select: none;
}

.mac-dots {
  display: flex;
  gap: 7px;
}

.mac-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.mac-dot--red {
  background: #ff5f57;
}

.mac-dot--yellow {
  background: #febc2e;
}

.mac-dot--green {
  background: #28c840;
}

.mac-titlebar__text {
  flex: 1;
  text-align: center;
  font-size: 13px;
  font-weight: var(--weight-semibold);
  color: var(--color-muted);
}

.mac-titlebar__spacer {
  width: 55px;
}

/* Toolbar */
.mac-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: var(--color-canvas-soft);
  border-bottom: 1px solid var(--color-hairline);
}

.mac-toolbar__search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--color-muted-soft);
}

/* Body layout */
.mac-body {
  display: flex;
  height: 320px;
}

/* Sidebar */
.mac-sidebar {
  width: 170px;
  flex-shrink: 0;
  padding: 10px 8px;
  background: var(--color-canvas-soft);
  border-right: 1px solid var(--color-hairline);
  overflow-y: auto;
}

.mac-sidebar__section + .mac-sidebar__section {
  margin-top: 8px;
}

.mac-sidebar__title {
  font-size: 10px;
  font-weight: var(--weight-semibold);
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 8px 6px;
}

.mac-sidebar__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--color-body);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.mac-sidebar__item:hover {
  background: var(--color-surface-strong);
}

.mac-sidebar__item--active {
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: var(--weight-medium);
}

.mac-sidebar__item--active:hover {
  background: var(--color-primary-active);
}

/* Main area */
.mac-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mac-canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  position: relative;
}

.mac-canvas__icon {
  color: var(--color-muted-soft);
  margin-bottom: 4px;
}

.mac-canvas__label {
  font-size: 11px;
  color: var(--color-muted-soft);
}

.mac-pixel-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3px;
  margin-top: 8px;
}

.mac-pixel {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  transition: transform 0.2s ease;
  animation: pixelPulse 3s ease-in-out infinite;
}

.mac-pixel:nth-child(2n) { animation-delay: 0.3s; }
.mac-pixel:nth-child(3n) { animation-delay: 0.6s; }
.mac-pixel:nth-child(5n) { animation-delay: 0.9s; }

@keyframes pixelPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

/* Bottom panel */
.mac-panel {
  padding: 10px 16px;
  border-top: 1px solid var(--color-hairline);
  background: var(--color-canvas-soft);
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.mac-panel__row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mac-panel__label {
  font-size: 11px;
  color: var(--color-muted);
}

.mac-panel__value {
  font-size: 11px;
  font-weight: var(--weight-semibold);
  color: var(--color-ink);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  padding: 2px 8px;
  border-radius: var(--radius-xs);
}

.mac-panel__row--btn {
  margin-left: auto;
}

/* ── Floating Badges ── */
.float-badge {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: var(--weight-semibold);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  animation: floatBounce 3s ease-in-out infinite;
  z-index: 2;
}

.float-badge--green {
  top: 60px;
  right: -20px;
  background: rgba(40, 200, 64, 0.12);
  color: #1f8a65;
  border: 1px solid rgba(40, 200, 64, 0.2);
}

.float-badge--orange {
  bottom: 60px;
  right: -10px;
  background: rgba(245, 78, 0, 0.12);
  color: var(--color-primary);
  border: 1px solid rgba(245, 78, 0, 0.2);
  animation-delay: 1.5s;
}

@keyframes floatBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* ── Section Titles ── */
.section-title {
  font-size: var(--text-xl);
  color: var(--color-ink);
  text-align: center;
  margin-bottom: var(--space-xs);
  letter-spacing: var(--tracking-wide);
}

.section-subtitle {
  text-align: center;
  font-size: var(--text-base);
  color: var(--color-muted);
  margin-bottom: var(--space-xl);
}

/* ── Feature Cards ── */
.features {
  padding: var(--space-section) 0;
}

.feature-card {
  cursor: pointer;
  padding: var(--space-xl);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  border-color: var(--color-hairline-strong);
}

.feature-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-base);
}

.feature-card__icon-wrap {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
}

.feature-card__icon-wrap--image {
  background: rgba(245, 78, 0, 0.08);
  color: var(--color-primary);
}

.feature-card__icon-wrap--sprite {
  background: rgba(192, 133, 50, 0.08);
  color: var(--color-pixel-yellow);
}

.feature-card__arrow {
  color: var(--color-muted-soft);
  transition: transform 0.2s ease, color 0.2s ease;
}

.feature-card:hover .feature-card__arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

.feature-card__title {
  margin-bottom: var(--space-xs);
}

.feature-card__desc {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-body);
  margin-bottom: var(--space-base);
}

.feature-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xxs);
}

.tag {
  display: inline-flex;
  align-items: center;
  background: var(--color-surface-strong);
  color: var(--color-body);
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.02em;
  border-radius: var(--radius-pill);
  padding: 4px 10px;
  transition: background-color 0.15s ease;
}

.feature-card:hover .tag {
  background: var(--color-hairline);
}

/* ── Mini Cards (Tool Grid) ── */
.tools-section {
  padding: var(--space-section) 0;
  background: var(--color-canvas-soft);
}

.mini-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg) var(--space-sm);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.mini-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  border-color: var(--color-hairline-strong);
}

.mini-card__icon {
  font-size: 28px;
  color: var(--color-ink);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-card__name {
  color: var(--color-ink);
}

.mini-card__desc {
  font-size: 11px;
  color: var(--color-muted);
  line-height: var(--leading-normal);
  text-align: center;
}

/* ── Highlight Cards ── */
.highlights-section {
  padding: var(--space-section) 0;
}

.highlight-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xl) var(--space-base);
  text-align: center;
}

.highlight-card__icon {
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-xs);
}

.highlight-card__title {
  margin: 0;
}

.highlight-card__desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 960px) {
  .hero__layout {
    flex-direction: column;
    align-items: stretch;
  }

  .hero__content {
    flex: none;
    max-width: 100%;
    text-align: center;
  }

  .hero__actions {
    justify-content: center;
  }

  .hero__window {
    max-width: 560px;
    margin: 0 auto;
  }
}

@media (max-width: 640px) {
  .hero__title {
    font-size: var(--text-3xl) !important;
  }

  .mac-window {
    transform: none;
  }

  .mac-window:hover {
    transform: none;
  }

  .mac-sidebar {
    width: 130px;
  }

  .mac-body {
    height: 260px;
  }

  .float-badge {
    display: none;
  }
}
</style>
