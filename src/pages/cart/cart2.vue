<template>
  <view>
    <cartMain :safe-area-bottom="statusBarHeight"></cartMain>
  </view>
</template>

<script lang="ts" setup>
  import { useSafeArea } from '@/composables/useSafeArea'
  import cartMain from './components/cartMain.vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { ref } from 'vue'
  const safeArea = useSafeArea()

  const statusBarHeight = ref<number>(0)
  onLoad(() => {
    const insetArea: UniApp.SafeAreaInsets = safeArea.getsafeArea() as UniApp.SafeAreaInsets
    statusBarHeight.value = insetArea.bottom || 0
  })
</script>
