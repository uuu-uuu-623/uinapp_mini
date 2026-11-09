<template>
  <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- Logo 区域 -->
    <view class="logo">
      <image src="@/static/images/logo.png" class="logo-image" mode="aspectFit" />
      <text class="logo-text">新鲜 · 亲民 · 快捷</text>
    </view>

    <!-- 搜索框区域 -->
    <view class="search-wrapper">
      <wd-search
        v-model="searchVal"
        focus-when-clear
        placeholder-left
        hide-cancel
        background="transparent"
        custom-class="my-navbar-search"
        custom-style="background: transparent !important; --wot-search-bg: transparent; --wot-search-plain-bg: transparent;"
      >
        <template #input-suffix>
          <view style="display: flex; gap: 10rpx; justify-content: center; align-items: center">
            <wd-icon name="scan" size="25px" color="#666" />
            <wd-button size="mini" round variant="plain" hairline>搜索</wd-button>
          </view>
        </template>
      </wd-search>
    </view>
  </view>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue'

  const searchVal = ref('')
  const statusBarHeight = ref(20)

  onMounted(() => {
    try {
      const sysInfo = uni.getSystemInfoSync()
      statusBarHeight.value = sysInfo.statusBarHeight || 20
    } catch (err) {
      console.warn('获取系统信息失败', err)
    }
  })
</script>

<style lang="scss" scoped>
  .navbar {
    position: relative;
    display: flex;
    flex-direction: column;

    // 使用品牌色变量，确保主题统一
    background-color: $brand-color;

    // 底部留出呼吸感，避免与页面内容粘连
    padding-bottom: 24rpx;

    .logo {
      display: flex;
      align-items: center;

      // 移除固定高度，让内容撑开，保证绝对居中
      padding: 20rpx 30rpx 16rpx;

      .logo-image {
        width: 166rpx;
        height: 39rpx;

        // 防止图片被压缩变形
        flex-shrink: 0;
      }

      .logo-text {
        color: rgb(255 255 255 / 90%);
        font-size: 26rpx;
        line-height: 1;
        margin-left: 20rpx;
        padding-left: 20rpx;
        border-left: 1rpx solid rgb(255 255 255 / 40%);

        // 文字过长时省略，防止挤破布局
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .search-wrapper {
      // 左右留出对称的安全边距
      padding: 0 24rpx;

      // 与 Logo 之间保持紧凑但清晰的间距
      margin-top: 4rpx;
    }
  }
</style>

<!-- 专门用于穿透组件样式的非 scoped 块 -->
<style lang="scss">
  .my-navbar-search {
    // 外层容器背景透明（配合 background="transparent" 双重保险）
    &.wd-search {
      background: transparent !important;
    }

    // 内部输入框区域 —— 这才是白色背景的真正来源
    .wd-search__field {
      background: rgb(255 255 255 / 15%) !important;
      border-radius: 36rpx !important;
    }

    // 如果 placeholder 颜色在深色背景下看不清，一并调整
    .wd-search__placeholder {
      color: rgb(255 255 255 / 60%) !important;
    }
  }
</style>
