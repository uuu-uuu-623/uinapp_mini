<template>
  <view class="box">
    <wd-skeleton animation="gradient" :loading="loading" :row-col="grid">
      <wd-grid bg-color="rgba(0, 0, 0, 0)" :column="5" clickable>
        <wd-grid-item
          v-for="item in cate"
          :key="item.id"
          :text="item.name"
          url="/pages/category/category"
          link-type="switchTab"
          custom-class="cate-grid-item"
          custom-text="cate-grid-text"
        >
          <template #icon>
            <wd-img
              class="cate-slot-icon"
              :src="item.icon"
              mode="aspectFit"
              width="80rpx"
              height="80rpx"
            ></wd-img>
          </template>
        </wd-grid-item>
      </wd-grid>
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import type { DataFromCategoryMutli } from '@/api/home/type.ts'
  import { reqCategoryMutli } from '@/api/home'
  import { useDataRefresh } from '@/pages/index/composable/useHomeRefresh'
  import type { SkeletonRowCol } from '@wot-ui/ui/components/wd-skeleton/types'

  // 样式配置
  defineOptions({
    options: {
      styleIsolation: 'shared',
    },
  })

  // 数据加载状态
  const loading = ref(false)

  // 存储前台分类 的数据
  const cate = ref<DataFromCategoryMutli[]>([])

  onMounted(async () => {
    await getCategoryMutli()
  })

  // 请求得到 分类数据
  const getCategoryMutli = async () => {
    if (loading.value) return
    loading.value = true
    try {
      const res = await reqCategoryMutli()
      cate.value = res
    } finally {
      loading.value = false
    }
  }

  // 刷新 重置函数
  const resetCategoryPanelData = async () => {
    loading.value = false
    cate.value = []
    await getCategoryMutli()
  }

  // 进入 刷新页面的清单
  useDataRefresh(resetCategoryPanelData)

  // 自定义骨架屏 占位配置
  const grid = [
    // 第一行 - 5列 图标
    [
      { width: '80rpx', height: '80rpx' },
      { width: '80rpx', height: '80rpx' },
      { width: '80rpx', height: '80rpx' },
      { width: '80rpx', height: '80rpx' },
      { width: '80rpx', height: '80rpx' },
    ],
    // 第二行 - 5列 文字
    [
      { width: '80rpx', height: '30rpx' },
      { width: '80rpx', height: '30rpx' },
      { width: '80rpx', height: '30rpx' },
      { width: '80rpx', height: '30rpx' },
      { width: '80rpx', height: '30rpx' },
    ],
    // 第三行 - 5列 图标
    [
      { width: '80rpx', height: '80rpx' },
      { width: '80rpx', height: '80rpx' },
      { width: '80rpx', height: '80rpx' },
      { width: '80rpx', height: '80rpx' },
      { width: '80rpx', height: '80rpx' },
    ],
    // 第四行 - 5列 文字
    [
      { width: '80rpx', height: '30rpx' },
      { width: '80rpx', height: '30rpx' },
      { width: '80rpx', height: '30rpx' },
      { width: '80rpx', height: '30rpx' },
      { width: '80rpx', height: '30rpx' },
    ],
  ] as SkeletonRowCol[]
</script>

<style scoped lang="scss">
  .box {
    margin: 20rpx 0;
    padding: 0 20rpx;
  }
</style>

<style lang="scss">
  .cate-grid-item {
    width: 120rpx;
    box-sizing: border-box;
  }

  /* 关键是这一层：wd-img 的 props 控制外层，:deep(image) 穿透到真实渲染的 image 标签 */
  .cate-slot-icon {
    width: 100rpx !important;
    height: 100rpx !important;
    display: block;
  }

  .cate-slot-icon :deep(image) {
    width: 100rpx !important;
    height: 100rpx !important;
  }

  .cate-grid-text {
    font-size: 22rpx;
    color: #666;
    line-height: 1.4;
    max-width: 120rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cate-grid-text :deep(view),
  .cate-grid-text :deep(text) {
    font-size: 22rpx;
    color: #666;
  }
</style>
