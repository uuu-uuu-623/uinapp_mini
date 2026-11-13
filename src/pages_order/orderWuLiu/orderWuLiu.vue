<template>
  <view class="logistics-page">
    <wd-skeleton :loading="isFirstShow" :row-col="rowColConfig" animation="gradient">
      <!-- 1. 顶部地图展示区 (保留原数据) -->
      <view class="map-wrapper">
        <map
          id="orderMap"
          :latitude="senderLat"
          :longitude="senderLng"
          :markers="markers"
          :polyline="polyline"
          :include-points="includePoints"
          style="width: 100%; height: 400rpx"
        ></map>
      </view>

      <!-- 2. 物流状态概览卡片 -->
      <view class="status-card">
        <view class="status-main">
          <text class="status-title">运输中</text>
          <text class="status-desc">您的包裹正在快马加鞭赶来，预计明天 15:00 前送达</text>
        </view>
      </view>

      <!-- 3. 快递公司及单号信息 -->
      <view class="express-card">
        <view class="express-header">
          <wd-icon name="bag" size="18px" color="#3591fc" custom-class="express-icon" />
          <text class="express-name">{{ wuliu?.company.name }}</text>
        </view>
        <view class="express-no">
          <text class="no-label">运单号：</text>
          <text class="no-value">{{ wuliu?.company.number }}</text>
          <wd-button size="mini" plain type="primary" @click="copyExpressNo" round>复制</wd-button>
        </view>
      </view>

      <!-- 4. 物流轨迹流程图 (使用 wotui wd-steps 竖向步骤条) -->
      <view class="track-card">
        <view class="track-title">物流轨迹</view>
        <view v-if="logisticsList.length === 0">
          <wd-empty tip="暂无物流轨迹" />
        </view>

        <wd-steps v-else direction="vertical" :active="activeStep" vertical dot>
          <wd-step v-for="(item, index) in logisticsList" :key="item.id">
            <!-- 使用 title 插槽自定义标题样式 -->
            <template #title>
              <view class="step-title" :class="{ 'is-active': index === activeStep }">
                {{ item.text }}
              </view>
            </template>
            <!-- 使用 description 插槽自定义描述和时间 -->
            <template #description>
              <view class="step-desc">
                <text class="desc-text">{{ item.text }}</text>
                <text class="desc-time">{{ item.time }}</text>
              </view>
            </template>
          </wd-step>
        </wd-steps>
      </view>
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { reqLogistics } from '@/api/order'
  import type { logistics, logisticsInfo } from '@/api/order/type'

  // 页面加载状态
  const loading = ref(false)
  // 骨架屏
  const isFirstShow = ref(true)
  // 订单的物流信息
  const wuliu = ref<logistics | null>(null)

  // ================= 物流轨迹数据 =================
  // 步骤条当前激活节点 (0 表示数组第一项，即最新物流状态)
  const activeStep = ref(0)

  // 模拟真实物流轨迹 (倒序排列，最新状态在最前)
  const logisticsList = ref<logisticsInfo[]>([])

  // 获取订单物流信息
  const getWuLiuInfo = async () => {
    if (!orderId.value || loading.value) return
    loading.value = true
    try {
      const res = await reqLogistics(orderId.value)
      wuliu.value = res
      logisticsList.value = res.list
    } catch {
      uni.showToast({ icon: 'none', title: '正在持续跟踪物流信息...' })
    } finally {
      loading.value = false
      if (isFirstShow.value) isFirstShow.value = false
    }
  }

  // 订单id
  const orderId = ref<string | null>(null)
  onLoad((options) => {
    if (options && options.orderId) {
      orderId.value = options.orderId
      getWuLiuInfo()
    }
  })

  // ============= map地图相关 =============
  // 天安门坐标
  // 39.918236,116.397244
  // 广州塔坐标
  // 23.104964,113.323747
  // 由于地图坐标没有后端接口 所以地图仅为测试练习使用
  const senderLat = 39.918236
  const senderLng = 116.397244
  const receiverLat = 23.104964
  const receiverLng = 113.323747

  const markers = ref([
    {
      id: 1,
      latitude: senderLat,
      longitude: senderLng,
      title: '发货点',
      iconPath: '/static/logo.png',
      width: 30,
      height: 30,
    },
    {
      id: 2,
      latitude: receiverLat,
      longitude: receiverLng,
      title: '收货点',
      iconPath: '/static/images/locate.png',
      width: 30,
      height: 30,
    },
  ])

  const polyline = ref([
    {
      points: [
        { latitude: senderLat, longitude: senderLng }, //发货地
        { latitude: 39.918, longitude: 116.405 }, // 中转站1（手动添加）
        { latitude: receiverLat, longitude: receiverLng }, //收货地
      ],
      color: '#3591fc',
      width: 6,
      arrowLine: true,
    },
  ])

  // 自动缩放视野包含起终点
  const includePoints = ref([
    { latitude: senderLat, longitude: senderLng },
    { latitude: receiverLat, longitude: receiverLng },
  ])

  // 复制运单号功能
  const copyExpressNo = () => {
    if (!wuliu.value) return
    uni.setClipboardData({
      data: wuliu.value.company.number,
      success: () => {
        uni.showToast({
          title: '运单号已复制',
          icon: 'none',
        })
      },
    })
  }

  const rowColConfig = ref([
    // 1. 模拟顶部地图区域 (400rpx 高度)
    { width: '100%', height: '400rpx' },

    // 2. 模拟状态概览卡片
    { width: '92%', height: '120rpx', marginTop: '20rpx', marginLeft: '4%' },

    // 3. 模拟快递公司及单号卡片
    { width: '92%', height: '140rpx', marginTop: '20rpx', marginLeft: '4%' },

    // 4. 模拟物流轨迹标题
    { width: '30%', height: '40rpx', marginTop: '30rpx', marginLeft: '4%' },

    // 5. 模拟物流轨迹时间轴节点 (多行递减宽度)
    { width: '85%', height: '80rpx', marginTop: '24rpx', marginLeft: '4%' },
    { width: '75%', height: '80rpx', marginTop: '16rpx', marginLeft: '4%' },
    { width: '65%', height: '80rpx', marginTop: '16rpx', marginLeft: '4%' },
    { width: '50%', height: '80rpx', marginTop: '16rpx', marginLeft: '4%' },
  ])
</script>

<style scoped lang="scss">
  .logistics-page {
    min-height: 100vh;
    background-color: #f5f7fa;
    padding-bottom: 40rpx;
  }

  /* 地图容器 */
  .map-wrapper {
    width: 100%;
    background-color: #fff;
    box-shadow: 0 4rpx 12rpx rgb(0 0 0 / 5%);
  }

  /* 状态卡片 */
  .status-card {
    margin: 20rpx 24rpx;
    padding: 30rpx;
    background-color: #fff;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4rpx 12rpx rgb(0 0 0 / 3%);

    .status-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12rpx;
    }

    .status-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #3591fc;
    }

    .status-desc {
      font-size: 26rpx;
      color: #666;
      line-height: 1.5;
    }
  }

  /* 快递信息卡片 */
  .express-card {
    margin: 0 24rpx 20rpx;
    padding: 30rpx;
    background-color: #fff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgb(0 0 0 / 3%);

    .express-header {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .express-icon {
        margin-right: 12rpx;
      }

      .express-name {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
      }
    }

    .express-no {
      display: flex;
      align-items: center;
      font-size: 26rpx;

      .no-label {
        color: #999;
      }

      .no-value {
        color: #333;
        margin-right: 20rpx;
        font-family: monospace;
      }
    }
  }

  /* 物流轨迹卡片 */
  .track-card {
    margin: 0 24rpx;
    padding: 30rpx;
    background-color: #fff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgb(0 0 0 / 3%);

    .track-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 30rpx;
      padding-left: 10rpx;
      border-left: 6rpx solid #3591fc;
    }

    // 覆盖 wot-design-uni 步骤条内部样式以适配物流时间轴
    :deep(.wd-steps) {
      padding: 0;
    }

    :deep(.wd-step) {
      padding-bottom: 40rpx;
    }

    :deep(.wd-step__line) {
      background-color: #e5e5e5;
    }

    .step-title {
      font-size: 28rpx;
      color: #999;
      font-weight: normal;
      margin-bottom: 10rpx;

      &.is-active {
        color: #333;
        font-weight: bold;
        font-size: 30rpx;
      }
    }

    .step-desc {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .desc-text {
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
      }

      .desc-time {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
</style>
