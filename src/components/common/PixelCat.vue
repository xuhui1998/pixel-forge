<script lang="ts" setup>
const stages = [{ type: 'loop', start: 0, end: 39 }]
const catSrc = `${import.meta.env.BASE_URL}pet.gif`
</script>

<template>
  <px-animation-frame
    :src="catSrc"
    :stages="stages"
    :width="120"
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
