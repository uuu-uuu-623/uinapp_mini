<template>
  <view class="HotPanel">
    <!-- 骨架屏 -->
    <wd-skeleton animation="gradient" :loading="loading" :row-col="grid">
      <template #default>
        <wd-grid border :column="2" clickable>
          <wd-grid-item
            v-for="item in hotList"
            :key="item.id"
            :url="`/pages/hot/hot?type=${item.type}`"
          >
            <template #default>
              <view class="top">
                <text>{{ item.title }}</text>
                <text class="title-desc">{{ item.alt }}</text>
              </view>
              <view class="bottom">
                <wd-img
                  width="150rpx"
                  height="150rpx"
                  v-for="(url, index) in (item.pictures || []).slice(0, 2)"
                  :key="index"
                  :src="url"
                  mode="aspectFit"
                  lazy-load
                ></wd-img>
              </view>
            </template>
          </wd-grid-item>
        </wd-grid>
      </template>
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
  import { reqHotMutli } from '@/api/home'
  import { ref, onMounted } from 'vue'
  import type { DataFromHotMulti } from '@/api/home/type'
  import { useDataRefresh } from '@/pages/index/composable/useHomeRefresh'
  import type { SkeletonRowCol } from '@wot-ui/ui/components/wd-skeleton/types'

  // 数据加载状态
  const loading = ref(false)

  // 存储 热门推荐数据
  const hotList = ref<DataFromHotMulti[]>([])

  // 页面挂载时 请求得到热门推荐数据
  onMounted(async () => {
    await getHotMutli()
  })

  // 请求得到热门推荐数据
  const getHotMutli = async () => {
    if (loading.value) return
    loading.value = true
    try {
      const res = await reqHotMutli()
      hotList.value = res
    } catch (err) {
      console.warn(err)
    } finally {
      loading.value = false
    }
  }

  // 刷新 重置数据
  const resetHotMutli = async () => {
    loading.value = false
    hotList.value = []
    await getHotMutli()
  }

  // 进入 刷新页面的清单
  useDataRefresh(resetHotMutli)

  // 自定义骨架屏 占位配置
  const grid = [
    // 第一行 - 2列
    [
      { width: '48%', height: '200rpx' },
      { width: '48%', height: '200rpx' },
    ],
    // 第二行 - 2列
    [
      { width: '48%', height: '200rpx' },
      { width: '48%', height: '200rpx' },
    ],
  ] as SkeletonRowCol[]
</script>

<style scoped lang="scss">
  .HotPanel {
    padding: 0 40rpx;
    margin-bottom: 20rpx;
  }

  .top {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 6rpx;
    padding: 0 30rpx;
    color: #262626;
    font-size: 32rpx;

    .title-desc {
      font-size: 24rpx;
      color: #7f7f7f;
      margin-left: 18rpx;
    }
  }

  .bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10rpx;
    padding: 10rpx 30rpx;
    padding-bottom: 0;
  }
</style>
