<template>
  <view class="wuliuProcess">
    <map
      id="orderMap"
      :latitude="senderLat"
      :longitude="senderLng"
      :markers="markers"
      :polyline="polyline"
      :include-points="includePoints"
      style="width: 100%; height: 400rpx"
    ></map>

    <!-- 物流 流程图 -->
  </view>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'

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
</script>

<style scoped lang="scss">
  .wuliuProcess {
    width: 750rpx;
    height: 40vh;
  }
</style>
