<template>
  <!-- 全局的 猜你喜欢组件 -->
  <!-- 用于首页 和 我的 页面的猜你喜欢模块 -->
  <!-- 
    竞态条件：当两个或多个异步操作并发执行时，
    程序的最终结果取决于这些操作的“完成顺序”，
    而这个顺序是不可预测的。 
  -->
  <view class="likeView">
    <view class="caption">
      <text class="text">猜你喜欢</text>
    </view>
    <wd-skeleton animation="gradient" :loading="isFirstLoading" :row-col="grid">
      <view class="info">
        <wd-grid :gutter="10" :column="2" clickable>
          <wd-grid-item
            v-for="item in goodsList"
            :key="item.id"
            :url="`/pages/goods/goods?id=${item.id}`"
          >
            <template #default>
              <wd-img
                width="284rpx"
                height="284rpx"
                :src="item.picture"
                mode="aspectFill"
                lazy-load
              />
              <view class="name">{{ item.name }}</view>
              <view class="price">
                <text class="small">¥</text>
                <text>{{ item.price }}</text>
              </view>
            </template>
          </wd-grid-item>
        </wd-grid>
      </view>
    </wd-skeleton>
    <view v-show="!isFirstLoading" class="loading-text">
      {{ noMoreData ? '-  没有更多商品了  -' : '正在加载...' }}
    </view>
  </view>
  <wd-toast></wd-toast>
</template>

<script lang="ts" setup>
  import { reqGuessLike } from '@/api/home'
  import type { DataFromGuessLike, Item_DataFromGuessLike, pageInfo } from '@/api/home/type'
  import { ref, onMounted, inject, onUnmounted } from 'vue'
  import { useToast } from '@wot-ui/ui/composables'
  // 引入通用组合式函数 当主页下拉刷新时 本组件也要刷新重置数据
  import { Refresh_KEY } from '@/composables/useDataRefresh'
  import type { SkeletonRowCol } from '@wot-ui/ui/components/wd-skeleton/types'
  // 引入封装的控制层
  import { SafeAbortController } from '@/utils/abort'

  // 如果是h5端会使用原生AbortController api
  // 如果是小程序或者app端 会使用封装的函数
  let controller = new SafeAbortController()

  // 信息toast提示
  const toast = useToast()

  // 页面首次加载
  const isFirstLoading = ref(true)

  // 是否正在加载分页数据
  const isloadingPage = ref(false)

  // 存储 每个商品的数据
  const goodsList = ref<Item_DataFromGuessLike[]>([])

  // 分页参数数据
  const pageConfig: pageInfo = {
    // 当前页码 默认值为1
    page: 1,
    // 当前页码数据的条数 默认值为10
    pageSize: 10,
  }

  // 是否还有数据
  const noMoreData = ref(false)

  // 请求的版本号控制
  let version: number = 0

  // 请求得到 每个商品的数据
  const getGuessLikeInfo = async () => {
    // 如果正在加载数据 或者 已经没有数据了的时候 就结束请求
    if (isloadingPage.value || noMoreData.value) return
    // 1. 取消上一次未完成的请求
    controller.abort()
    // 2. 重建新的 controller（旧 signal 已废弃，不可复用）
    controller = new SafeAbortController()

    isloadingPage.value = true

    // 记录当前请求版本号
    // -- 每次调用该函数的时候 由于闭包机制 currentVersion的内存引用都不一致
    // -- 而version 版本是全局的变量 所以version是内存引用是一样的 即可以被修改
    // -- 到下面判断的时候 version被修改 version++ 但是currentVersion不变
    // -- 即版本号不一致 就会舍弃请求
    const currentVersion = ++version

    try {
      const res: DataFromGuessLike = await reqGuessLike(controller.signal, pageConfig)
      // 请求的版本不一致时 直接return
      if (currentVersion !== version) return

      // 追加新数据
      goodsList.value.push(...res.items)

      // 判断 是否在最后一页
      // 当前页 小于 总页码时
      if (pageConfig.page <= res.pages) {
        // 当前页++
        pageConfig.page++
      } else {
        noMoreData.value = true
        toast.show({
          position: 'middle',
          msg: '没有更多数据了,请刷新页面~',
        })
      }
    } catch (error) {
      if (currentVersion === version) console.warn(error)
    } finally {
      // 当请求版本号成功对上 即请求成功时 改变加载状态
      if (currentVersion === version) {
        isloadingPage.value = false
        // 首次加载完成，关闭骨架屏
        isFirstLoading.value = false
      }
    }
  }

  // 当组件挂载时
  onMounted(async () => {
    await getGuessLikeInfo()
  })

  onUnmounted(() => {
    // 组件卸载时取消正在进行的请求
    controller.abort()
  })

  // 重置数据
  const resetGuessLikeData = async () => {
    // 重置前也先取消可能存在的旧请求
    controller.abort()
    goodsList.value = []
    pageConfig.page = 1
    pageConfig.pageSize = 10
    noMoreData.value = false
    isloadingPage.value = false
    isFirstLoading.value = true // 重置骨架屏状态
    await getGuessLikeInfo()
  }

  // 注入 刷新重置数据函数
  const refreshContext = inject(Refresh_KEY)
  if (refreshContext) {
    refreshContext.register(resetGuessLikeData)
  }

  // 暴露给父组件的函数
  // 当父组件触底时 请求得到分页的数据
  defineExpose({ loadingMore: getGuessLikeInfo })

  // 自定义骨架屏 占位配置
  const grid = [
    // 第一行 - 2列
    [
      { width: '330rpx', height: '400rpx' },
      { width: '330rpx', height: '400rpx' },
    ],
    // 第二行 - 2列
    [
      { width: '330rpx', height: '400rpx' },
      { width: '330rpx', height: '400rpx' },
    ],
  ] as SkeletonRowCol[]
</script>

<style scoped lang="scss">
  .likeView {
    padding: 0 20rpx;

    /* 分类标题 */
    .caption {
      display: flex;
      justify-content: center;
      line-height: 1;
      font-size: 32rpx;
      color: #262626;

      .text {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20rpx;

        &::before,
        &::after {
          content: '';
          width: 20rpx;
          height: 20rpx;
          background-image: url('@/static/images/bubble.png');
          background-size: contain;
          margin: 0 10rpx;
        }
      }
    }

    .info {
      padding: 20rpx 10rpx;
    }

    .name {
      height: 75rpx;
      margin: 10rpx 0;
      font-size: 26rpx;
      text-align: left;
      color: #262626;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .price {
      line-height: 1;
      padding-top: 4rpx;
      color: #cf4444;
      font-size: 26rpx;
      text-align: left;
    }

    .small {
      font-size: 80%;
    }

    // 加载提示文字
    .loading-text {
      text-align: center;
      font-size: 28rpx;
      color: #666;
      padding: 20rpx 0;
    }
  }
</style>
