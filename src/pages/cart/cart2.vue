<template>
  <view>
    <cartMain :safe-area-bottom="statusBarHeight"></cartMain>
  </view>
</template>

<script lang="ts" setup>
  import cartMain from './components/cartMain.vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { ref } from 'vue'

  const statusBarHeight = ref<number>(0)
  onLoad(() => {
    const sysInfo = uni.getSystemInfoSync()
    statusBarHeight.value = sysInfo.safeAreaInsets?.bottom || 0
  })
</script>
