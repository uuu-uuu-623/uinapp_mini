<template>
  <view class="container">
    <scroll-view
      scroll-y
      scroll-with-animation
      enable-back-to-top
      refresher-enabled
      class="scroll-content"
      @scrolltolower="onScrollLower"
    >
      <view class="pay-success-page">
        <!-- 顶部状态区域 -->
        <view class="status-section">
          <wd-icon name="check-circle-fill" size="64px" color="#07c160" />
          <text class="status-title">支付成功</text>
          <text class="status-desc">感谢您的购买，我们将尽快为您发货</text>
        </view>

        <!-- 操作按钮 -->
        <view class="action-section">
          <wd-button
            type="primary"
            block
            round
            @click="handleViewOrder"
            custom-style="margin-bottom:20rpx"
          >
            查看订单
          </wd-button>
          <wd-button variant="plain" block round custom-class="mt-12" @click="handleBackHome">
            返回首页
          </wd-button>
        </view>

        <wd-skeleton animation="gradient" :loading="isFristShow" :row-col="grid">
          <!-- 订单信息卡片 -->
          <view class="order-card" v-if="orderInfo">
            <wd-cell-group border>
              <wd-cell title="订单编号" :value="orderInfo.id" />
              <wd-cell
                title="支付金额"
                :value="'¥' + orderInfo.payMoney"
                custom-class="price-cell"
              />
              <wd-cell title="支付方式" :value="payChannel" />
              <wd-cell title="支付时间" :value="orderInfo.payTime" v-if="orderInfo.payTime" />
            </wd-cell-group>
          </view>
        </wd-skeleton>

        <XtxGuessLike ref="guessLike"></XtxGuessLike>
      </view>
    </scroll-view>
  </view>
  <wd-toast cover :z-index="110"></wd-toast>
</template>

<script setup lang="ts">
  import { reqOrderDetail } from '@/api/order'
  import { onLoad } from '@dcloudio/uni-app'
  import XtxGuessLike from '@/components/XtxGuessLike/XtxGuessLike.vue'
  import { useToast } from '@wot-ui/ui/composables'
  import { orderDetail } from '@/api/order/type'
  import { ref, computed } from 'vue'

  const toast = useToast()
  const loading = ref(false)
  const isFristShow = ref(true)
  const guessLike = ref<InstanceType<typeof XtxGuessLike>>()

  const payChannel = computed(() => {
    if (orderInfo.value?.payChannel === 1) {
      return '支付宝'
    } else if (orderInfo.value?.payChannel === 2) {
      return '微信支付'
    } else {
      return '其他支付'
    }
  })

  // 订单id
  const orderId = ref<string | null>(null)
  const orderInfo = ref<orderDetail>()
  // 获取订单详情
  const getOrder = async () => {
    if (!orderId.value) return
    if (loading.value) return
    loading.value = true
    try {
      const res = await reqOrderDetail(orderId.value)
      const { skus, ...orderData } = res
      orderInfo.value = orderData
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
      if (isFristShow.value) isFristShow.value = false
    }
  }

  // 接收路由参数（如订单号、金额等）
  onLoad(async (options) => {
    if (options && options.orderId) {
      orderId.value = options.orderId
      await getOrder()
    }
  })

  // 滚动到底部
  const onScrollLower = () => {
    guessLike.value?.loadingMore()
  }

  // 查看订单详情
  const handleViewOrder = () => {
    if (!orderId.value) {
      toast.error('获取订单详情失败')
      return
    }
    uni.navigateTo({
      url: `/pages_order/orderDetail/orderDetail?id=${orderId.value}`,
    })
  }

  // 返回首页
  const handleBackHome = () => {
    uni.switchTab({
      url: '/pages/index/index',
    })
  }

  const grid = [{ width: '100%', height: '300rpx', borderRadius: '0' }]
</script>

<style lang="scss" scoped>
  .container {
    display: flex;
    height: 100vh;
    background-color: #f7f8fa;
    flex-direction: column;
  }
  .scroll-content {
    flex: 1;
    min-height: 0;
  }

  .pay-success-page {
    background-color: #f5f5f5;
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* 顶部成功状态 */
  .status-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 32rpx 40rpx;
    background-color: #fff;

    .status-title {
      margin-top: 24rpx;
      font-size: 40rpx;
      font-weight: 600;
      color: #333;
    }

    .status-desc {
      margin-top: 12rpx;
      font-size: 26rpx;
      color: #999;
    }
  }

  /* 订单信息卡片 */
  .order-card {
    margin: 24rpx 32rpx;
    border-radius: 16rpx;
    overflow: hidden;
    background-color: #fff;

    :deep(.price-cell) {
      .wd-cell__value {
        color: #fa4126;
        font-weight: 600;
      }
    }
  }

  /* 底部按钮区 */
  .action-section {
    padding: 32rpx;
    background-color: #fff;
    margin: 16rpx 0 24rpx;

    .mt-12 {
      margin-top: 24rpx;
    }
  }
</style>
