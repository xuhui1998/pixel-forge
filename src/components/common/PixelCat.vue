<script lang="ts" setup>
const stages = [{ type: 'loop', start: 0, end: 39 }]
</script>

<template>
  <px-animation-frame
    src="/cat.gif"
    :stages="stages"
    :width="120"
    :height="124"
    overflow
    class="pixel-cat"
  />
</template>

<style scoped>
.pixel-cat {
  position: fixed;
  bottom: 16px;
  right: 24px;
  z-index: 999;
  image-rendering: pixelated;
}
</style>
