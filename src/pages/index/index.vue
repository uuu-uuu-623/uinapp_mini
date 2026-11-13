<template>
  <view class="HomeLayout">
    <!-- 自定义导航栏 -->
    <CustomNavigation></CustomNavigation>
    <!-- 滚动区域 开启下拉刷新 -->
    <scroll-view
      scroll-y
      class="scroll-area"
      scroll-with-animation
      enable-back-to-top
      refresher-enabled
      :refresher-triggered="isRefresh"
      lower-threshold="65"
      @scrolltolower="scrollToLower"
      @refresherrefresh="onRefreshData"
    >
      <view style="min-height: 100%">
        <!-- 轮播图 -->
        <XtxSwiper :which-page="1"></XtxSwiper>
        <!-- 前台分类组件 -->
        <CategoryPanel></CategoryPanel>
        <!-- 热门推荐 -->
        <HotPanel></HotPanel>
        <!-- 猜你喜欢 -->
        <XtxGuessLike ref="guessLikeRef"></XtxGuessLike>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import CustomNavigation from './components/CustomNavigation/CustomNavigation.vue'
  import CategoryPanel from './components/CategpryPanel/CategoryPanel.vue'
  import XtxGuessLike from '@/components/XtxGuessLike/XtxGuessLike.vue'
  import HotPanel from './components/HotPanel/HotPanel.vue'
  import { triggerHomeRefresh, provideHomeRefresh } from './composable/useHomeRefresh.js'

  // 顶层 setup 调用 让所有子孙组件可以inject注入
  provideHomeRefresh()

  // 猜你喜欢组件的 ref
  const guessLikeRef = ref<InstanceType<typeof XtxGuessLike>>()

  // 是否开启下拉刷新
  const isRefresh = ref(false)

  // 当滚动容器触底的时候 的回调函数
  const scrollToLower = () => {
    guessLikeRef.value?.loadingMore()
  }

  // 当下拉刷新滚动区域的时候 的回调函数
  const onRefreshData = async () => {
    if (isRefresh.value) return
    isRefresh.value = true
    try {
      await triggerHomeRefresh()
    } catch (error) {
      console.warn(error)
    } finally {
      isRefresh.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .HomeLayout {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .scroll-area {
    flex: 1;
    min-height: 0; /* 关键！防止被内容撑开 */
  }
</style>
