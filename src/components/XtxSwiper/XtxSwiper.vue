<template>
  <!-- 全局的 轮播图组件 -->
  <!-- 用于主页和分类页 -->
  <wd-skeleton animation="gradient" :loading="loadingSwiper" :row-col="grid">
    <view v-if="bannerList.length > 0">
      <wd-swiper
        :list="swiperList"
        height="300rpx"
        autoplay
        loop
        v-model:current="current"
        :indicator="{ type: 'dots-bar' }"
        image-mode="aspectFit"
      />
    </view>
  </wd-skeleton>
</template>

<script lang="ts" setup>
  import { ref, inject, computed, onMounted } from 'vue'
  import { reqBannerInHomeOrGoods } from '@/api/home/index'
  import type { DataFromBanner } from '@/api/home/type.ts'
  import { Refresh_KEY } from '@/composables/useDataRefresh'
  import type { SkeletonRowCol } from '@wot-ui/ui/components/wd-skeleton/types'
  const p = defineProps<{
    whichPage: number
  }>()

  // 加载状态
  const loadingSwiper = ref(false)

  // 存储 请求到的轮播图数据
  const bannerList = ref<DataFromBanner[]>([])
  // 计算得到 轮播图 图片数组
  const swiperList = computed(() => {
    if (bannerList.value.length === 0) return []
    const arr: Array<string> = []
    bannerList.value.map((item) => {
      arr.push(item.imgUrl)
    })
    return arr
  })
  const current = ref(0) // 当前图片

  // 当页面加载时 请求的到轮播图数据
  const getBannerData = async () => {
    if (loadingSwiper.value) return
    loadingSwiper.value = true
    try {
      const res = await reqBannerInHomeOrGoods(p.whichPage)
      // request 已经 resolve(result)，res 直接就是数组
      // 因为在封装的request中 已经判断了是否success
      // 所以这里不用判断code===200  跟web端不一样的
      bannerList.value = Array.isArray(res) ? res : []
    } catch (e) {
      console.error('banner 请求失败:', e)
    } finally {
      loadingSwiper.value = false
    }
  }

  onMounted(async () => {
    await getBannerData()
  })

  // 刷新 重置函数
  const resetSwiperData = async () => {
    loadingSwiper.value = false
    bannerList.value = []
    await getBannerData()
  }

  // 如果成功 注入  则注册这个重置函数到 刷新组件数据清单
  const refreshContext = inject(Refresh_KEY)
  if (refreshContext) {
    refreshContext.register(resetSwiperData)
  }

  const grid = [
    // 第一行 - 1列 图片
    [{ height: '300rpx' }],
  ] as SkeletonRowCol[]
</script>

<style scoped></style>
