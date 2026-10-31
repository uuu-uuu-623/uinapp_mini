<template>
  <view class="settings-page">
    <!-- 设置列表组 -->
    <view class="list-wrapper">
      <wd-card>
        <wd-cell-group border>
          <wd-cell
            v-for="(item, index) in menuList"
            :key="index"
            :title="item.title"
            is-link
            @click="handleMenuClick(item)"
          />
        </wd-cell-group>
      </wd-card>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-wrapper" v-if="userStore.isLogin">
      <wd-button block plain type="danger" @click="handleLogout">退出登录</wd-button>
    </view>

    <!-- 底部版本号 -->
    <view class="version-info">
      <text>小程序版本: 2.30.1</text>
    </view>
  </view>
  <wd-dialog />
</template>

<script setup lang="ts">
  import { ref, onBeforeUnmount } from 'vue'
  import { useDialog } from '@wot-ui/ui'
  import { useUserStore } from '@/stores/modules/user'

  const userStore = useUserStore()

  // 定义菜单项类型
  interface MenuItem {
    title: string
    path?: string
  }

  const dialog = useDialog()

  // 菜单数据
  const menuList = ref<MenuItem[]>([
    { title: '用户服务协议', path: '' },
    { title: '隐私政策', path: '' },
    { title: '权限设置', path: '' },
    { title: '其他设置', path: '' },
    { title: '支付设置', path: '' },
    { title: '个人信息共享清单', path: '' },
    { title: '个人信息收集清单', path: '' },
    { title: '隐私政策摘要', path: '' },
  ])

  // 点击菜单项跳转
  const handleMenuClick = (item: MenuItem) => {
    if (item.path) {
      uni.navigateTo({ url: item.path })
    } else {
      uni.showToast({ title: '功能开发中', icon: 'none' })
    }
  }

  let timer: ReturnType<typeof setTimeout> | null = null
  // 退出登录
  const handleLogout = () => {
    dialog
      .confirm({
        icon: 'warning',
        iconProps: { size: '80rpx' },
        title: '提示',
        msg: '确认要退出登陆吗?',
      })
      .then(() => {
        if (timer !== null) {
          clearTimeout(timer)
        }
        userStore.logout()
        uni.showToast({ icon: 'success', title: '退出成功' })
        timer = setTimeout(() => {
          // 返回上一页
          uni.navigateBack()
          timer = null
        }, 1500)
      })
      .catch(() => {
        console.log('点击了取消')
      })
  }

  onBeforeUnmount(() => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null // ✅ 清理后置空
    }
  })
</script>

<style lang="scss" scoped>
  .settings-page {
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  .list-wrapper {
    margin: 24rpx 0;
  }

  .logout-wrapper {
    margin: 32rpx 24rpx;
  }

  .version-info {
    position: fixed;
    bottom: 60rpx;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    color: #c8c9cc;
    font-size: 24rpx;
    margin-top: 60rpx;
  }
</style>
