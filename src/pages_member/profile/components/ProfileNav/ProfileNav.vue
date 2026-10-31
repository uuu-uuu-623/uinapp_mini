<template>
  <!-- 自定义导航栏 -->
  <wd-navbar
    safe-area-inset-top
    left-arrow
    title="个人信息"
    @click-left="backTomy"
    custom-style="background-color: transparent !important;width:750rpx"
  ></wd-navbar>
  <view class="nav">
    <!-- 头像和 点击修改头像 -->
    <wd-avatar :src="userStore.userDetailInfo?.avatar" size="180rpx" />
    <wd-button variant="text" round icon="edit" type="info" @click="updateAvatar">
      点击修改头像
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
  // import { ref } from 'vue'
  import { useUserStore } from '@/stores/modules/user'

  const userStore = useUserStore()

  // 点击左箭头 返回会员信息页
  const backTomy = () => {
    uni.navigateBack({ delta: 1 })
  }

  const updateAvatar = () => {
    // #ifdef MP-WEIXIN
    // 微信使用 uni.chooseMedia
    uni.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        if (res.type !== 'image') return
        const filePath = res.tempFiles[0]?.tempFilePath ?? ''
        userStore.UpdateUserAvatar(filePath)
      },
      fail: () => {
        uni.showToast({ icon: 'error', title: '请求错误，请重试' })
      },
    })
    // #endif

    // #ifndef MP-WEIXIN
    // 其他端使用 uni.chooseImage
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res: any) => {
        const filePath = res.tempFiles?.[0]?.tempFilePath ?? ''
        if (!filePath) {
          uni.showToast({ icon: 'error', title: '未选择图片' })
          return
        }
        userStore.UpdateUserAvatar(filePath)
      },
      fail: () => {
        uni.showToast({ icon: 'error', title: '请求错误，请重试' })
      },
    })
    // #endif
  }
</script>

<style scoped lang="scss">
  .nav {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20rpx;
    width: 100%;
    margin: 40rpx 0;
  }
</style>
