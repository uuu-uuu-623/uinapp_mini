<template>
  <view :style="{ paddingTop: statusBarHeight + 'px' }" class="user">
    <view class="userInfo">
      <!-- 头像 -->
      <view @click="updateUserInfo">
        <wd-avatar :src="userStore.userInfo?.avatar" size="160rpx" v-if="userStore.isLogin" />
        <wd-avatar icon="user" v-else size="160rpx" />
      </view>
      <view class="nickname" v-if="userStore.isLogin">
        <text>
          <text style="font-size: 26rpx; color: #333">会员名:</text>
          {{ userStore.userInfo?.nickname || userStore.userInfo?.account || '' }}
        </text>
        <view class="updateInfo" @click="updateUserInfo">更改个人信息</view>
      </view>
      <view v-else>
        <wd-button @click="toLogin">去登录</wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { useUserStore } from '@/stores/modules/user'

  const userStore = useUserStore()

  const statusBarHeight = ref(20)
  onMounted(() => {
    try {
      const sysInfo = uni.getSystemInfoSync()
      statusBarHeight.value = sysInfo.statusBarHeight || 20
    } catch (err) {
      console.warn('获取系统信息失败', err)
    }
  })

  const updateUserInfo = () => {
    // 前往 分包页面 修改个人信息页面
    uni.navigateTo({
      url: '/pages_member/profile/profile',
    })
  }

  const toLogin = () => {
    // 去登陆页
    uni.navigateTo({
      url: '/pages/login/login',
    })
  }
</script>

<style scoped lang="scss">
  .user {
    padding: 0 40rpx;
    margin-bottom: 40rpx;

    .userInfo {
      display: flex;
      justify-content: start;
      align-items: center;
      gap: 40rpx;
      padding-top: 20rpx;
    }

    .nickname {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 20rpx;
      color: #333;
      font-size: 36rpx;

      .updateInfo {
        padding: 6rpx 10rpx;
        color: #333;
        font-size: 24rpx;
        border: 1px solid #676464;
        border-radius: 15px;
      }
    }
  }
</style>
