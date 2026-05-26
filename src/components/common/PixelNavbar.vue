<template>
  <nav class="navbar">
    <div class="navbar-inner container">
      <!-- Logo -->
      <router-link to="/" class="navbar-brand">
        <img :src="`${baseURL}favicon.svg`" alt="PixelForge" class="navbar-logo pixel-render" />
        <span class="navbar-title">PixelForge</span>
      </router-link>

      <!-- Navigation Tabs -->
      <div class="navbar-tabs">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="navbar-tab"
          :class="{ active: isActive(link) }"
        >
          <component :is="link.icon" :size="16" :stroke-width="1.5" class="navbar-tab__icon" />
          <span>{{ link.label }}</span>
        </router-link>
      </div>

      <!-- Right Actions -->
      <div class="navbar-actions">
        <!-- Theme Switcher -->
        <div class="theme-switcher">
          <button
            v-for="mode in themeModes"
            :key="mode.value"
            class="theme-btn"
            :class="{ active: currentTheme === mode.value }"
            :title="mode.label"
            @click="setTheme(mode.value)"
          >
            <component :is="mode.icon" :size="15" :stroke-width="1.5" />
          </button>
        </div>

        <div class="navbar-divider"></div>

        <!-- Help -->
        <router-link to="/help" class="navbar-icon-btn" title="使用帮助">
          <HelpCircle :size="18" :stroke-width="1.5" />
        </router-link>

        <div class="navbar-divider"></div>

        <!-- GitHub -->
        <a
          href="https://github.com/xuhui1998/pixel-forge"
          target="_blank"
          rel="noopener noreferrer"
          class="navbar-icon-btn"
          title="GitHub"
        >
          <IconGithub />
        </a>
      </div>

      <!-- Mobile Toggle -->
      <button class="navbar-toggle" @click="mobileOpen = !mobileOpen" aria-label="菜单">
        <span class="toggle-bar"></span>
        <span class="toggle-bar"></span>
        <span class="toggle-bar"></span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileOpen" class="navbar-mobile">
      <router-link
        v-for="link in navLinks"
        :key="link.path"
        :to="link.path"
        class="navbar-mobile-link"
        :class="{ active: isActive(link) }"
        @click="mobileOpen = false"
      >
        <component :is="link.icon" :size="18" :stroke-width="1.5" />
        <span>{{ link.label }}</span>
      </router-link>
      <div class="navbar-mobile-divider"></div>
      <div class="navbar-mobile-actions">
        <router-link to="/help" class="navbar-mobile-link" @click="mobileOpen = false">
          <HelpCircle :size="18" :stroke-width="1.5" />
          <span>使用帮助</span>
        </router-link>
        <div class="theme-switcher">
          <button
            v-for="mode in themeModes"
            :key="mode.value"
            class="theme-btn"
            :class="{ active: currentTheme === mode.value }"
            @click="setTheme(mode.value)"
          >
            <component :is="mode.icon" :size="15" :stroke-width="1.5" />
            <span>{{ mode.label }}</span>
          </button>
        </div>
        <a
          href="https://github.com/xuhui1998/pixel-forge"
          target="_blank"
          rel="noopener noreferrer"
          class="navbar-mobile-link"
        >
          <IconGithub />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Image, Film, PenTool, Sun, Moon, Monitor, HelpCircle } from 'lucide-vue-next'
import IconGithub from '../icons/IconGithub.vue'

const baseURL = import.meta.env.BASE_URL

type ThemeMode = 'light' | 'dark' | 'system'

const route = useRoute()
const mobileOpen = ref(false)
const currentTheme = ref<ThemeMode>(
  (localStorage.getItem('pixelforge-theme') as ThemeMode) || 'system'
)

const navLinks = [
  { path: '/', label: '首页', icon: Home, exact: true },
  { path: '/image', label: '图片处理', icon: Image, exact: false },
  { path: '/sprite', label: '精灵图', icon: Film, exact: false },
  { path: '/editor', label: '图片编辑', icon: PenTool, exact: false },
]

const themeModes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '日间', icon: Sun },
  { value: 'dark', label: '夜间', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor },
]

function isActive(link: { path: string; exact?: boolean }): boolean {
  if (link.exact) return route.path === '/'
  return route.path.startsWith(link.path)
}

function setTheme(mode: ThemeMode) {
  currentTheme.value = mode
  localStorage.setItem('pixelforge-theme', mode)
  applyTheme(mode)
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', isDark)
}

watchEffect(() => applyTheme(currentTheme.value))

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (currentTheme.value === 'system') applyTheme('system')
})
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(247, 247, 244, 0.88);
  border-bottom: 1px solid var(--color-hairline);
  backdrop-filter: blur(12px) saturate(1.4);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
}

.navbar-inner {
  display: flex;
  align-items: center;
  height: var(--nav-height);
  gap: 24px;
}

/* ── Brand ── */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-ink);
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}

.navbar-brand:hover {
  opacity: 0.8;
}

.navbar-logo {
  width: 26px;
  height: 26px;
}

.navbar-title {
  font-family: var(--font-pixel);
  font-size: 13px;
  font-weight: var(--weight-bold);
  letter-spacing: 0.5px;
  color: var(--color-ink);
}

/* ── Tabs ── */
.navbar-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
  padding-left: 8px;
  flex: 1;
}

.navbar-tab {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 14px;
  text-decoration: none;
  color: var(--color-body);
  font-size: 13.5px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.01em;
  border-radius: 6px;
  transition: color 0.15s ease, background-color 0.15s ease;
  position: relative;
  white-space: nowrap;
  user-select: none;
}

.navbar-tab__icon {
  flex-shrink: 0;
  opacity: 0.65;
  transition: opacity 0.15s ease;
}

.navbar-tab:hover {
  color: var(--color-ink);
  background: rgba(38, 37, 30, 0.045);
}

.navbar-tab:hover .navbar-tab__icon {
  opacity: 1;
}

.navbar-tab.active {
  color: var(--color-ink);
  font-weight: var(--weight-semibold);
}

.navbar-tab.active .navbar-tab__icon {
  opacity: 1;
  color: var(--color-primary);
}

.navbar-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 2px;
  border-radius: 1px;
  background: var(--color-primary);
}

/* ── Right Actions ── */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: auto;
}

.navbar-divider {
  width: 1px;
  height: 20px;
  background: var(--color-hairline);
  margin: 0 4px;
}

.navbar-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  color: var(--color-body);
  text-decoration: none;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.navbar-icon-btn:hover {
  color: var(--color-ink);
  background: rgba(38, 37, 30, 0.045);
}

/* ── Theme Switcher ── */
.theme-switcher {
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(38, 37, 30, 0.04);
  border-radius: 8px;
  padding: 2px;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 6px;
  border: none;
  background: transparent;
  color: var(--color-muted);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: color 0.15s ease, background-color 0.15s ease;
  white-space: nowrap;
}

.theme-btn:hover {
  color: var(--color-ink);
}

.theme-btn.active {
  color: var(--color-ink);
  background: var(--color-surface-card);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

/* ── Mobile Toggle ── */
.navbar-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.15s ease;
  margin-left: auto;
}

.navbar-toggle:hover {
  background: rgba(38, 37, 30, 0.05);
}

.toggle-bar {
  display: block;
  width: 18px;
  height: 1.5px;
  background: var(--color-ink);
  border-radius: 1px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* ── Mobile Menu ── */
.navbar-mobile {
  display: none;
  flex-direction: column;
  padding: 8px 16px 16px;
  border-top: 1px solid var(--color-hairline);
  background: var(--color-canvas);
}

.navbar-mobile-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 12px;
  text-decoration: none;
  color: var(--color-body);
  font-size: 14px;
  font-weight: var(--weight-medium);
  border-radius: 8px;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.navbar-mobile-link:hover {
  background: rgba(38, 37, 30, 0.04);
  color: var(--color-ink);
}

.navbar-mobile-link.active {
  color: var(--color-primary);
  background: rgba(245, 78, 0, 0.06);
}

.navbar-mobile-divider {
  height: 1px;
  background: var(--color-hairline);
  margin: 8px 0;
}

.navbar-mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.navbar-mobile-actions .theme-switcher {
  padding: 6px;
  margin-bottom: 4px;
}

.navbar-mobile-actions .theme-btn {
  padding: 8px 10px;
  font-size: 13px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .navbar-tabs,
  .navbar-actions {
    display: none;
  }

  .navbar-toggle {
    display: flex;
  }

  .navbar-mobile {
    display: flex;
  }
}

/* ── Dark Mode ── */
html.dark .navbar {
  background: rgba(26, 25, 22, 0.88);
  border-bottom-color: var(--color-hairline);
}

html.dark .navbar-tab:hover {
  background: rgba(255, 255, 255, 0.05);
}

html.dark .theme-switcher {
  background: rgba(255, 255, 255, 0.06);
}

html.dark .theme-btn.active {
  background: var(--color-surface-card);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

html.dark .navbar-icon-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

html.dark .navbar-mobile {
  background: var(--color-canvas);
}

html.dark .navbar-mobile-link:hover {
  background: rgba(255, 255, 255, 0.04);
}

html.dark .navbar-mobile-link.active {
  background: rgba(255, 106, 26, 0.08);
}

html.dark .toggle-bar {
  background: var(--color-ink);
}
</style>
