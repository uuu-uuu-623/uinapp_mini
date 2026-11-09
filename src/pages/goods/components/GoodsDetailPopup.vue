<template>
  <wd-popup
    v-model="popupVisible"
    position="bottom"
    custom-style="min-height: 30vh; max-height: 70vh;"
    closable
    safe-area-inset-bottom
    lock-scroll
  >
    <!-- 弹窗内部使用 scroll-view 支持长列表滚动 -->
    <scroll-view scroll-y class="popup-scroll-container">
      <slot></slot>
    </scroll-view>
  </wd-popup>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'

  const props = defineProps<{ show: boolean }>()
  const emit = defineEmits<{ (e: 'update:show', value: boolean): void }>()

  const popupVisible = computed({
    get: () => props.show,
    set: (val) => emit('update:show', val),
  })
</script>

<style lang="scss" scoped>
  .popup-scroll-container {
    height: 100%;
    box-sizing: border-box;
  }
</style>
