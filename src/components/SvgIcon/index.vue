<template>
  <!-- #ifdef H5 -->
  <svg class="custom-icon" :style="{ width, height, color }" aria-hidden="true">
    <use :href="`#icon-${name}`" />
  </svg>
  <!-- #endif -->

  <!-- #ifndef H5 -->
  <image
    class="custom-icon"
    :src="`/static/icons/${name}.png`"
    :style="{ width, height }"
    mode="aspectFit"
  />
  <!-- #endif -->
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      name: string
      color?: string
      width?: string
      height?: string
    }>(),
    {
      color: '#333',
      width: '20px',
      height: '20px',
    },
  )
</script>

<style scoped lang="scss">
  .custom-icon {
    display: inline-block;
    vertical-align: middle;

    /* 防止小程序 image 标签默认的底部空白间隙 */
    line-height: 1;
  }
</style>
