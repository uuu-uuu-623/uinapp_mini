<template>
  <view class="viewport">
    <!-- 推荐封面图 -->
    <view class="cover">
      <wd-img width="100%" height="225rpx" :src="subData.bannerPicture" />
    </view>
    <!-- 推荐选项 -->
    <wd-tabs
      v-if="subData.subTypes.length"
      v-model="tab"
      :swipeable="swipeable"
      :animated="swipeable"
      @change="changeTab_active"
    >
      <wd-tab
        v-for="subModelTabs in subData.subTypes"
        :key="subModelTabs.id"
        :title="subModelTabs.title"
        :name="subModelTabs.id"
        lazy
      >
        <template #default>
          <!-- 推荐列表 -->
          <view class="goods">
            <wd-grid :column="2" clickable>
              <wd-grid-item
                v-for="goods in subModelTabs.goodsItems.items"
                :key="goods.id"
                :url="`/pages/goods/goods?id=${goods.id}`"
              >
                <template #default>
                  <wd-img
                    width="285rpx"
                    height="285rpx"
                    :src="goods.picture"
                    mode="aspectFill"
                    lazy-load
                  />
                  <view class="name">{{ goods.name }}</view>
                  <view class="price">
                    <text class="small">¥</text>
                    <text>{{ goods.price }}</text>
                  </view>
                </template>
              </wd-grid-item>
            </wd-grid>
          </view>
          <view class="loading-text">
            {{ noMoreData ? '- 没有更多数据了 -' : loading ? '正在加载...' : '' }}
          </view>
        </template>
      </wd-tab>
    </wd-tabs>
  </view>
  <wd-backtop :scroll-top="scrollTop"></wd-backtop>
  <wd-toast></wd-toast>
</template>

<script lang="ts" setup>
  import { getHot_SonModel_Config, reqHotRecommend, type HotType } from '@/api/hot'
  import type { DataFromHot_SonModel, Hot_SonModel_Query, SubType } from '@/api/hot/type'
  import {
    onLoad,
    onPageScroll,
    onReachBottom,
    onPullDownRefresh,
    onUnload,
  } from '@dcloudio/uni-app'
  import { computed, ref } from 'vue'
  import { useToast } from '@wot-ui/ui/composables'
  // 引入abort控制 取消旧请求 防止覆盖新请求
  import { SafeAbortController } from '@/utils/abort'

  // new controller类
  let controller = new SafeAbortController()
  // 采用 请求的版本控制
  let version: number = 0

  // wd 信息toast提示
  const toast = useToast()

  // 骨架屏第一次加载状态
  // const isFristLoading = ref(true)
  // 页面数据加载状态
  const loading = ref(false)
  // 是否还有商品数据
  const noMoreData = ref(false)

  // tabs 标签的 当前激活项
  const tab = ref<string>('')

  // 页面滚动到 距离页面顶部多少
  const scrollTop = ref(0)
  // 控制tabs组件 是否可以滑动
  const swipeable = ref(true)

  // 接收 首页HotPanel模块 跳转传递的参数
  const type = ref<HotType>('1')

  // 根据type得到 热门推荐 子模块的配置
  const config = computed(() => {
    return getHot_SonModel_Config(type.value)
  })

  // 请求参数
  const query: Hot_SonModel_Query = {
    page: 1,
    pageSize: 10,
    // 只有首次加载时才为空 所以在首次请求的时候 要同步tabId
    // 当切换tab或者触底分页加载数据都有tabId
    subType: '', //Tab 项的 id
  }

  // 初始化/重置 子模块数据的函数
  const createDefalutSubModelData = (): DataFromHot_SonModel => {
    return {
      // 活动图片
      bannerPicture: '',
      // id信息
      id: '',
      // tabs 子类选项集合
      subTypes: [],
      // 活动标题
      title: '',
    }
  }

  // 获得当前tabs标签中 被激活的tab数据  根据tabId查找tab数据
  // 当成功找到时 得到的是内存引用
  const findCurrentTabData = (list: SubType[], tabId: string): SubType | undefined => {
    return list.find((item) => item.id === tabId)
  }

  // 用于存储 热门推荐下 子模块的数据 (要初始化)
  const subData = ref<DataFromHot_SonModel>(createDefalutSubModelData())

  // 发送请求 得到热门推荐子模块的数据 以及子模块中的tab标签
  const getHotRemmendData = async () => {
    if (loading.value || noMoreData.value) return
    // 1.先取消上次未完成的请求 发送取消请求信号
    controller.abort()
    // 在重新建立一个 新的控制层
    controller = new SafeAbortController()

    // 建立当前版本号
    const currentVersion = ++version

    loading.value = true
    noMoreData.value = false

    try {
      const res: DataFromHot_SonModel = await reqHotRecommend(
        config.value.url,
        controller.signal,
        query,
      )
      if (currentVersion !== version) return

      // 如果在第一页
      // -- 如果一开始不在第一页首次加载
      // -- 则不会同步首次 query.subType和tab.value 的tabId
      // -- 导致出错
      if (query.page === 1) {
        // 解决首次加载 和 切换tab时 不丢失该子模块另外的tab数据
        // 实现精准局部更新

        if (!subData.value.subTypes[0]?.id) {
          // 如果是首次加载 - 整体赋值
          subData.value = res
          // 同步激活的 tab 和 subType（否则触底时 subType 还是空）
          if (res.subTypes.length && !query.subType) {
            // 因为时首次加载 所以是res.subTypes 中的第一个数组(默认)
            query.subType = res.subTypes[0]?.id as string
            tab.value = res.subTypes[0]?.id as string
          }
        } else {
          // 如果不是首次加载 那就是切换了tab或者下拉刷新了页面
          // 当切换tab时 只更新对应的tab数据 不能污染其他的tab数据
          // 即我的TabA有三页数据 当我切换TabB 不只更新对应的tab数据 采用subData.value = res整体替换 则TabA数据也被重新赋值

          // 找到本地存储的subData - 得到的内存引用 浅拷
          const oldTabData = findCurrentTabData(subData.value.subTypes, query.subType as string)
          // 接口新返回的数据源
          const resReturnTabData =
            findCurrentTabData(res.subTypes, query.subType as string) ?? res.subTypes[0]
          if (oldTabData && resReturnTabData) {
            // 把新数据给到本地subData  模板中会渲染subData
            oldTabData.goodsItems = resReturnTabData.goodsItems
          }
        }
      } else {
        // 不在第一页 就push分页追加
        // 这直接就是当前页的商品数据追加
        const currTabData = findCurrentTabData(subData.value.subTypes, query.subType as string)
        const resReturnTabData =
          findCurrentTabData(res.subTypes, query.subType as string) ?? res.subTypes[0]
        if (currTabData && resReturnTabData) {
          // push 追加数据
          currTabData.goodsItems.items.push(...resReturnTabData.goodsItems.items)
          currTabData.goodsItems.counts = resReturnTabData.goodsItems.counts
          currTabData.goodsItems.page = resReturnTabData.goodsItems.page
          currTabData.goodsItems.pages = resReturnTabData.goodsItems.pages
        }
      }
    } catch (error) {
      console.warn(error)
    } finally {
      if (currentVersion === version) {
        loading.value = false
      }
      // 仅首次加载完成后关闭骨架屏
      // if (isFristLoading.value) isFristLoading.value = false
    }
  }

  onLoad(async (option) => {
    // 采用非空断言 得到type
    type.value = (option?.type as HotType) ?? '1'
    // 根据type的值 得到config配置中的title 设置标题
    uni.setNavigationBarTitle({ title: config.value.title })
    await getHotRemmendData()
  })

  // onPageScroll 生命周期
  // 获取滚动距离，再通过 scroll-top 传递给组件。
  onPageScroll((event) => {
    // 监听页面滚动位置
    scrollTop.value = event.scrollTop
    // 判断 tabs是否可以滑动 不在页面顶部的时候可以滑动
    if (scrollTop.value >= 145) {
      swipeable.value = false
    } else {
      swipeable.value = true
    }
  })

  // onReachBottom 生命周期
  // 页面滚动到底部附近（默认距底 50px）时自动触发
  // 可以在 pages.json 里调整触发距离
  onReachBottom(async () => {
    // 在加载状态 或者没有商品数据了 则不请求
    if (loading.value || noMoreData.value) return
    // 没有tabid 终止 - 一定要在首次请求时同步tabId
    if (!query.subType) return
    // 获取当前的tab数据
    const currentTabData = findCurrentTabData(subData.value.subTypes, query.subType)
    // 未找到 tab数据 则终止
    if (!currentTabData) return
    // 获取当前页
    const page = Number(currentTabData.goodsItems.page) || (query.page as number)
    // 获取总页数
    const pages = Number(currentTabData.goodsItems.pages)
    // 当前页大于等于总页数时 不发请求
    if (page >= pages && pages) {
      // 没有数据了
      noMoreData.value = true
      toast.show({
        position: 'middle',
        msg: '没有更多数据了,请刷新页面~',
      })

      return
    } else {
      noMoreData.value = false
      // 页面触底且还没到最后一页时 当前页码page+1 并发送请求获取数据
      query.page = page + 1

      await getHotRemmendData()
    }
  })

  // onPullDownRefresh 生命周期
  // 下拉页面刷新
  onPullDownRefresh(async () => {
    // 1. 重置分页和没有更多数据的状态
    query.page = 1
    noMoreData.value = false

    // 2. 复用现有请求逻辑（内部已处理 page===1 的局部更新）
    await getHotRemmendData()

    // 3. 停止下拉动画（必须调用，建议放 finally 或最后）
    uni.stopPullDownRefresh()
  })

  // 当页面 销毁的时候
  // 调用 controller.abort() 取消正在进行的请求
  onUnload(() => {
    // 取消正在进行的请求
    controller.abort()
  })

  // 切换当前激活项的 回调函数
  // 切换 tab 时重置页码并按需请求
  const changeTab_active = async ({ name }: { index: number | string; name: number | string }) => {
    // index时tabs数组索引值 name是tab 绑定的标识 默认为索引值
    // 获取tabId  name绑定的值时tabId
    query.subType = String(name)
    // 切换tab时要重置页码page
    query.page = 1
    const currentTabData = findCurrentTabData(subData.value.subTypes, name as string)
    // 如果该tab已经被请求过有数据了 就不用发请求
    // 否则 就是没有数据 请求第一页的数据
    if (!currentTabData || currentTabData.goodsItems.items.length === 0) {
      await getHotRemmendData()
    }
  }
</script>

<style scoped lang="scss">
  page {
    height: 100%;
  }

  .viewport {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 210rpx 0 0;
    position: relative;
  }

  .cover {
    width: 100%;
    height: 225rpx;
    overflow: hidden;
    position: absolute;
    left: 0;
    top: 0;
  }

  .goods {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 20rpx 10rpx;
    background-color: #f4f4f4;

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
  }

  // 加载提示文字
  .loading-text {
    text-align: center;
    font-size: 28rpx;
    color: #666;
    padding: 20rpx 0;
    background-color: #f4f4f4;
  }

  :deep(.wd-tabs__nav-item) {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  :deep(.wd-grid-item) {
    padding: 0 10rpx 20rpx !important;
  }
</style>
