<template>
  <view class="container">
    <!-- 顶部背景装饰 -->
    <view class="bg-decoration"></view>
    <scroll-view
      class="scroll-area"
      scroll-y
      scroll-with-animation
      enable-back-to-top
      @scrolltolower="scrollToLower"
    >
      <view style="min-height: 100%">
        <MyCustomNav></MyCustomNav>
        <MyOrderAndSetting></MyOrderAndSetting>
        <XtxGuessLike ref="guessLikeRef"></XtxGuessLike>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
  import MyOrderAndSetting from './components/MyOrderAndSetting/MyOrderAndSetting.vue'
  import XtxGuessLike from '@/components/XtxGuessLike/XtxGuessLike.vue'
  import MyCustomNav from './components/MyCustomNav/MyCustomNav.vue'
  import { ref } from 'vue'

  // 猜你喜欢组件的 ref
  const guessLikeRef = ref<InstanceType<typeof XtxGuessLike>>()

  // 当滚动容器触底的时候 的回调函数
  const scrollToLower = () => {
    guessLikeRef.value?.loadingMore()
  }
</script>

<style lang="scss" scoped>
  .container {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f7f8fa;
  }

  /* 顶部背景装饰 */
  .bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50vh;
    background: linear-gradient(180deg, #eef6ff 50%, #f7f8fa 100%);
    z-index: 0;
  }

  .scroll-area {
    flex: 1;
    min-height: 0; /* 关键！防止被内容撑开 */
  }
</style>
