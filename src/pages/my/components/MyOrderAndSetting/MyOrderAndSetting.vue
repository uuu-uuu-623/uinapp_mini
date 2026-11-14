<template>
  <view class="myOrder">
    <wd-card title="我的订单" :gutter="0">
      <template #default>
        <wd-grid clickable>
          <wd-grid-item v-for="item in myOrderList" :key="item.text" @click="toUrl(item.url)">
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
          <wd-grid-item v-for="item in mySetting" :key="item.text" @click="toUrl(item.url)">
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
  import { AllOrderState } from '@/api/order/type'

  const userStore = useUserStore()

  // 解决 :deep()  无法穿透问题
  defineOptions({
    options: {
      styleIsolation: 'shared',
    },
  })

  const orderListState = AllOrderState

  interface setting {
    icon: string
    text: string
    url: string
  }

  const toUrl = (path: string) => {
    if (!userStore.isLogin) {
      uni.navigateTo({ url: '/pages/login/login' })
    } else if (path === '') {
      uni.showToast({ title: '功能开发中...' })
    } else {
      uni.navigateTo({ url: path })
    }
  }

  const myOrderList: setting[] = [
    {
      icon: 'menu',
      text: '全部订单',
      url: `/pages_order/orderList/orderList?orderState=${orderListState.listState.QuanBu}`,
    },
    {
      icon: 'stamp',
      text: '待支付',
      url: `/pages_order/orderList/orderList?orderState=${orderListState.orderState.DaiFuKuan}`,
    },
    {
      icon: 'gift',
      text: '待发货',
      url: `/pages_order/orderList/orderList?orderState=${orderListState.orderState.DaiFaHuo}`,
    },
    {
      icon: 'check-circle',
      text: '待收货',
      url: `/pages_order/orderList/orderList?orderState=${orderListState.orderState.DaiShouHuo}`,
    },
    {
      icon: 'file',
      text: '待评价',
      url: `/pages_order/orderList/orderList?orderState=${orderListState.orderState.DaiPingJia}`,
    },
  ]

  const mySetting: setting[] = [
    { icon: 'settings', text: '设置', url: '/pages_member/settings/settings' },
    {
      icon: 'location',
      text: '收货地址',
      url: '/pages_member/address/address',
    },
    { icon: 'common', text: '我的收藏', url: '' },
    { icon: 'mic', text: '客服', url: '' },
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
