<template>
  <div id="app">
    <PixelNavbar />
    <main class="main-content">
      <router-view />
    </main>
    <PixelCat />
  </div>
</template>

<script setup lang="ts">
import PixelNavbar from './components/common/PixelNavbar.vue'
import PixelCat from './components/common/PixelCat.vue'
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.main-content {
  flex: 1;
  min-height: 100vh;
  overflow: auto;
}
</style>
