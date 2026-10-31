<template>
  <view class="myOrder">
    <wd-card title="我的订单" :gutter="0">
      <template #default>
        <wd-grid clickable>
          <wd-grid-item v-for="item in myOrderList" :key="item.text">
            <template #icon>
              <wd-icon :name="item.icon" size="50rpx"></wd-icon>
            </template>
            <template #text>
              <text>{{ item.text }}</text>
            </template>
          </wd-grid-item>
        </wd-grid>
      </template>
    </wd-card>
  </view>

  <view class="mysetting">
    <wd-card>
      <template #default>
        <wd-grid clickable>
          <!-- v-if比v-for等级高 -->
          <wd-grid-item v-for="item in mySetting" :key="item.text" :url="item.url">
            <template #icon>
              <wd-icon :name="item.icon" size="50rpx"></wd-icon>
            </template>
            <template #text>
              <text>{{ item.text }}</text>
            </template>
          </wd-grid-item>
        </wd-grid>
      </template>
    </wd-card>
  </view>
</template>

<script lang="ts" setup>
  import { useUserStore } from '@/stores/modules/user'

  // import { ref } from 'vue'

  const userStore = useUserStore()

  // 解决 :deep()  无法穿透问题
  defineOptions({
    options: {
      styleIsolation: 'shared',
    },
  })

  interface setting {
    icon: string
    text: string
    url: string
  }

  const myOrderList: setting[] = [
    { icon: 'stamp', text: '待支付', url: userStore.isLogin ? '' : '/pages/login/login' },
    { icon: 'gift', text: '待发货', url: userStore.isLogin ? '' : '/pages/login/login' },
    { icon: 'check-circle', text: '待收货', url: userStore.isLogin ? '' : '/pages/login/login' },
    { icon: 'file', text: '待评价', url: userStore.isLogin ? '' : '/pages/login/login' },
    { icon: 'menu', text: '全部订单', url: userStore.isLogin ? '' : '/pages/login/login' },
  ]

  const mySetting: setting[] = [
    { icon: 'settings', text: '设置', url: '/pages_member/settings/settings' },
    {
      icon: 'location',
      text: '收货地址',
      url: userStore.isLogin ? '/pages_member/address/address' : '/pages/login/login',
    },
    { icon: 'message', text: '订阅消息', url: userStore.isLogin ? '' : '/pages/login/login' },
    { icon: 'mic', text: '客服', url: userStore.isLogin ? '' : '/pages/login/login' },
  ]
</script>

<style scoped lang="scss">
  .myOrder {
    margin: 20rpx 0;

    :deep(.wd-grid-item__content) {
      padding: 0 !important;
    }
  }

  .mysetting {
    margin: 40rpx 0;

    :deep(.wd-grid-item__content) {
      padding: 0 !important;
    }
  }
</style>
