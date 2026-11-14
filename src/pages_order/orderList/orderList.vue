<template>
  <!-- 首屏加载 -->
  <view class="page-loading" v-if="pageLoading">
    <wd-loading text="加载中..." :size="30" />
  </view>

  <view class="orderList" v-else>
    <wd-tabs v-model="activeTab" @change="onChangeTab" custom-style="background-color: #fff;">
      <wd-tab v-for="tab in orderTabs" :key="tab.key" :title="tab.title" :name="tab.key" lazy>
        <template #default>
          <view
            class="tab-content"
            :style="{
              backgroundColor:
                tabStateMap[tab.key]?.loading && (tabStateMap[tab.key]?.list.length ?? 0) === 0
                  ? '#fff'
                  : '#f5f5f5',
            }"
          >
            <!-- 首次加载中 -->
            <view
              class="tab-loading"
              v-if="tabStateMap[tab.key]?.loading && (tabStateMap[tab.key]?.list.length ?? 0) === 0"
            >
              <wd-loading text="加载中..." :size="30" />
            </view>

            <!-- 空状态 -->
            <view
              class="tab-empty"
              v-else-if="
                tabStateMap[tab.key]?.loaded &&
                !tabStateMap[tab.key]?.loading &&
                (tabStateMap[tab.key]?.list.length ?? 0) === 0
              "
            >
              <wd-empty tip="暂无订单" />
            </view>

            <!-- 订单列表 -->
            <scroll-view
              v-else
              :id="`scroll-area-${tab.key}`"
              class="scroll-area"
              :style="{ height: scrollHeight + 'px' }"
              scroll-y
              scroll-with-animation
              enable-back-to-top
              refresher-enabled
              :refresher-triggered="tabStateMap[tab.key]?.refreshing ?? false"
              :refresher-threshold="80"
              refresher-background="#f5f5f5"
              :lower-threshold="65"
              @scrolltolower="onScrollLower(tab.key)"
              @refresherrefresh="onScrollRefresh(tab.key)"
              @refresherabort="onRefresherAbort(tab.key)"
            >
              <view class="scroll-content">
                <view
                  class="no-daiFuKuan-data"
                  v-if="
                    getEffectiveList(tab.key).length === 0 &&
                    tab.key === AllOrderState.orderState.DaiFuKuan
                  "
                >
                  <wd-empty icon="no-content" tip="暂无该订单内容" :icon-size="70"></wd-empty>
                </view>

                <template v-else>
                  <view
                    v-for="item in getEffectiveList(tab.key)"
                    :key="item.id"
                    style="margin-bottom: 20rpx"
                  >
                    <wd-card>
                      <template #title>
                        <!-- 下单时间 + 订单状态 -->
                        <view class="time-and-state">
                          <view
                            style="
                              font-size: 30rpx;
                              color: #333;
                              display: flex;
                              align-items: baseline;
                              justify-content: center;
                            "
                            v-if="
                              getEffectiveOrderState(item) === AllOrderState.orderState.DaiFuKuan
                            "
                          >
                            <wd-count-down
                              :time="(item.countdown || 0) * 1000"
                              format="mm 分 ss 秒"
                              auto-start
                              @finish="onCountdownFinish(item)"
                            />
                            <text style="color: #999">后订单关闭</text>
                          </view>
                          <view class="creat-time" v-else>
                            <text>{{ item.createTime }}</text>
                          </view>

                          <!-- 状态文案统一由 getOrderStateText 计算：
                               全部订单里也能正确显示「已完成 / 已取消」 -->
                          <view class="state" :class="{ 'state--pending': isPendingState(item) }">
                            <text>{{ getOrderStateText(item) }}</text>
                          </view>
                        </view>
                      </template>
                      <template #default>
                        <view class="goods-section" @click="goOrderDetail(item.id)">
                          <view class="goods-item" v-for="good in item.skus" :key="good.id">
                            <image class="goods-img" :src="good.image" mode="aspectFill" />
                            <view class="goods-info">
                              <view class="goods-title">{{ good.name }}</view>
                              <view class="goods-spec">{{ good.attrsText }}</view>
                              <view class="goods-price-row">
                                <view class="price-wrap">
                                  <text class="symbol">￥</text>
                                  <text class="price">{{ good.realPay }}</text>
                                </view>
                                <text class="quantity">x{{ good.quantity }}</text>
                              </view>
                            </view>
                          </view>

                          <view class="payMoney">
                            <text style="color: #999; font-size: 28rpx; font-weight: 500">
                              实付：
                            </text>
                            <text style="color: #e74c3c; font-size: 30rpx; font-weight: 500">
                              {{ Number(item.payMoney).toFixed(2) }}
                            </text>
                          </view>

                          <!-- 按钮组 -->
                          <view class="good-btn" @click.stop>
                            <!-- 删除订单 -->
                            <view
                              class="del-order"
                              v-if="
                                [
                                  AllOrderState.orderState.DaiPingJia,
                                  AllOrderState.orderState.YiWanCheng,
                                  AllOrderState.orderState.YiQuXiao,
                                ].includes(getEffectiveOrderState(item))
                              "
                            >
                              <view class="del-icon" @click="onDelOrder(item.id)">
                                <wd-icon name="delete" size="48rpx" color="#e74c3c"></wd-icon>
                              </view>
                            </view>

                            <!-- 更多 包含去评价、申请售后、查看物流 -->
                            <!-- 给气泡加 v-if，把状态判断提到组件上 -->
                            <wd-popover
                              v-if="
                                activeTab === tab.key &&
                                [
                                  AllOrderState.orderState.DaiPingJia,
                                  AllOrderState.orderState.DaiShouHuo,
                                  AllOrderState.orderState.YiWanCheng,
                                ].includes(getEffectiveOrderState(item))
                              "
                              v-model="item.showMorePopover"
                              mode="menu"
                              :placement="popoverPlacement"
                              :content="
                                [
                                  AllOrderState.orderState.DaiPingJia,
                                  AllOrderState.orderState.YiWanCheng,
                                ].includes(getEffectiveOrderState(item))
                                  ? [
                                      { content: '去评价' },
                                      { content: '申请售后' },
                                      { content: '查看物流' },
                                    ]
                                  : [{ content: '查看物流' }]
                              "
                              @menuclick="(e) => onMenuClick(e, item)"
                            >
                              <template #default>
                                <wd-button variant="text" type="info">更多</wd-button>
                              </template>
                            </wd-popover>

                            <!-- 以下按钮统一使用 getEffectiveOrderState(item)，
                                 与顶部状态文案保持同一套判定逻辑 -->
                            <!-- 再次购买 -->
                            <wd-button
                              round
                              variant="plain"
                              type="success"
                              size="small"
                              @click="onBuyAggin(item.id)"
                              v-if="
                                getEffectiveOrderState(item) !== AllOrderState.orderState.DaiFuKuan
                              "
                            >
                              再次购买
                            </wd-button>

                            <!-- 取消订单 -->
                            <wd-button
                              type="info"
                              round
                              variant="plain"
                              size="small"
                              @click="onCancleOrder(item)"
                              v-if="
                                getEffectiveOrderState(item) === AllOrderState.orderState.DaiFuKuan
                              "
                            >
                              取消订单
                            </wd-button>

                            <!-- 去支付 -->
                            <wd-button
                              :loading="item.mockPayLoading"
                              type="primary"
                              size="small"
                              round
                              @click="onMockPay(item)"
                              v-if="
                                getEffectiveOrderState(item) === AllOrderState.orderState.DaiFuKuan
                              "
                            >
                              模拟支付
                            </wd-button>
                            <!-- 真实支付 -->
                            <wd-button
                              :loading="item.mockPayLoading"
                              type="primary"
                              size="small"
                              round
                              v-if="false"
                              @click="onPay(item)"
                            >
                              去支付
                            </wd-button>

                            <!-- 确认收货 -->
                            <wd-button
                              size="small"
                              type="primary"
                              round
                              @click="onReceipt(item.id)"
                              v-if="
                                getEffectiveOrderState(item) === AllOrderState.orderState.DaiShouHuo
                              "
                            >
                              确认收货
                            </wd-button>
                          </view>
                        </view>
                      </template>
                    </wd-card>
                  </view>
                  <view class="loading-text" :style="{ paddingBottom: bottomSafe }">
                    <wd-loading v-if="tabStateMap[tab.key]?.loading" color="#666"></wd-loading>
                    {{
                      tabStateMap[tab.key]?.hasMore === false
                        ? '- 没有更多数据了 -'
                        : tabStateMap[tab.key]?.loading
                          ? '正在加载...'
                          : ''
                    }}
                  </view>
                </template>
              </view>
            </scroll-view>
          </view>
        </template>
      </wd-tab>
    </wd-tabs>
  </view>

  <!-- 取消订单弹出层 -->
  <wd-popup
    v-model="showCancleOrderPopup"
    position="bottom"
    custom-style="height: 800rpx;"
    closable
    lock-scroll
    round
    lazy-render
    safe-area-inset-bottom
  >
    <template #default>
      <view class="popup-container">
        <!-- 头部标题 -->
        <view class="popup-header">
          <text>选择取消原因</text>
        </view>

        <!-- 滚动内容区 -->
        <scroll-view scroll-y class="popup-content">
          <view
            v-for="item in cancelReason"
            :key="item.rid"
            class="reason-item"
            :class="{ active: selectedReasonId === item.rid }"
            @click="handleSelect(item.rid)"
          >
            <text>{{ item.reason }}</text>
            <!-- 选中状态图标 -->
            <wd-icon
              v-if="selectedReasonId === item.rid"
              name="check"
              size="20px"
              color="#1c64fd"
            />
          </view>
        </scroll-view>

        <!-- 底部按钮 -->
        <view
          class="popup-footer"
          :style="{
            padding: '20rpx 40rpx',
          }"
        >
          <wd-button
            block
            type="primary"
            round
            @click="handleConfirmCancel"
            :loading="SureCancelLoading"
          >
            确定取消
          </wd-button>
        </view>
      </view>
    </template>
  </wd-popup>

  <!-- 去评价弹出层 -->
  <CommentPopup
    v-model:show-comment-popup="showCommentPopup"
    @is-yi-wan-cheng="orderStateToYiWanCheng"
  ></CommentPopup>

  <wd-toast cover />
  <wd-dialog></wd-dialog>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, nextTick } from 'vue'
  import { onLoad, onUnload } from '@dcloudio/uni-app'
  import { useToast, useDialog } from '@wot-ui/ui/composables'
  import { reqOrderList } from '@/api/order'
  import {
    AllOrderState,
    orderStateEnum,
    type orderList_item,
    type orderList_Params,
  } from '@/api/order/type'
  import { SafeAbortController, type SafeAbortControllerType } from '@/utils/abort'
  import { useSafeArea } from '@/composables/useSafeArea'
  import { reqCancelOrder, reqReceiptOrder, reqDelOrder } from '@/api/order'
  import { reqPay, reqMockPay } from '@/api/pay'
  import type { PopoverMenuItem } from '@wot-ui/ui/composables/usePopover'
  import CommentPopup from '../components/CommentPopup.vue'

  // ==================== 基础工具 ====================
  const toast = useToast()
  const dialog = useDialog()
  const safeArea = useSafeArea()
  const safeBottom = ref<number>(0)
  const bottomSafe = computed(() => `${safeBottom.value || 15}px`)
  const pageLoading = ref(true)
  // 评价弹出层
  const showCommentPopup = ref(false)

  // 定时器id
  let timer: ReturnType<typeof setTimeout> | null = null

  /**
   * 小程序原生 scroll-view 必须拿到「明确的 px 高度」。
   *
   * 原来整条链路靠 flex:1 + min-height:0 传递高度，父级没有确定高度时，
   * scroll-view 会退化成「被内容撑开 / 页面级滚动」，于是 scrollTop 恒为 0：
   *   1. 任何位置的下拉都被原生判定为「在顶部下拉」→ 疯狂触发 refresherrefresh
   *   2. @scroll 上报的 scrollTop 永远是 0 → 回顶按钮永远不满足显示条件
   * 这两件事其实是同一个根因。
   */
  // wot-ui wd-tabs 默认 nav 高度 = 24px 行高 + 上下各 10px padding = 44px（组件用的是 px）
  const TAB_NAV_FALLBACK = 44
  const scrollHeight = ref(0)

  const updateScrollHeight = async () => {
    await nextTick()
    const { windowHeight } = uni.getSystemInfoSync()
    // 先给兜底值：即使节点查询失败，页面也能立刻拥有可滚动的高度
    scrollHeight.value = Math.max(0, windowHeight - TAB_NAV_FALLBACK)

    // 再用真实 nav 高度校准，自定义样式 / 组件升级后依然准确
    const query = uni.createSelectorQuery()
    query
      .select('.wd-tabs__nav')
      .boundingClientRect((rect) => {
        const node = Array.isArray(rect) ? rect[0] : rect
        const navHeight = Number(node?.height ?? 0) || 0
        if (navHeight > 0 && navHeight < 200) {
          scrollHeight.value = Math.max(0, windowHeight - navHeight)
        }
      })
      .exec()
  }

  // ==================== Tab 定义 ====================
  const orderTabs = [
    { key: AllOrderState.listState.QuanBu, title: '全部' },
    { key: AllOrderState.orderState.DaiFuKuan, title: '待付款' },
    { key: AllOrderState.orderState.DaiFaHuo, title: '待发货' },
    { key: AllOrderState.orderState.DaiShouHuo, title: '待收货' },
    { key: AllOrderState.orderState.DaiPingJia, title: '待评价' },
  ] as const

  /**
   * 订单状态 → 展示文案
   * ⚠️ 必须用「枚举值」做 key 的映射表，不能用数组下标去取：
   *    状态是 1~6，而数组下标是从 0 开始的，orderTabs[5] / [6] 永远是 undefined。
   */
  const orderStateText: Record<orderStateEnum, string> = {
    [orderStateEnum.DaiFuKuan]: '待付款',
    [orderStateEnum.DaiFaHuo]: '待发货',
    [orderStateEnum.DaiShouHuo]: '待收货',
    [orderStateEnum.DaiPingJia]: '待评价',
    [orderStateEnum.YiWanCheng]: '已完成',
    [orderStateEnum.YiQuXiao]: '已取消',
  }

  /**
   * 计算订单「对用户可见的真实状态」。
   *
   * 后端在待付款订单超时后，orderState 可能仍是 1（DaiFuKuan），只是 countdown = -1；
   * 业务上它已经是「已取消」。所有状态相关的展示与按钮判断都走这一个入口，
   * 避免出现「状态显示已取消，按钮却还是取消订单 / 模拟支付」的不一致。
   */
  const getEffectiveOrderState = (item: orderList_item): orderStateEnum => {
    if (item.orderState === AllOrderState.orderState.DaiFuKuan && item.countdown === -1) {
      return AllOrderState.orderState.YiQuXiao
    }
    return item.orderState as orderStateEnum
  }

  /** 状态文案：只由订单数据决定，与当前所在 Tab 无关 */
  const getOrderStateText = (item: orderList_item): string =>
    orderStateText[getEffectiveOrderState(item)] ?? '未知状态'

  /** 待办类状态用主题色强调（可按需调整） */
  const isPendingState = (item: orderList_item): boolean => {
    return [orderStateEnum.DaiFuKuan, orderStateEnum.DaiPingJia].includes(
      getEffectiveOrderState(item),
    )
  }

  type TabKey = (typeof orderTabs)[number]['key']

  const activeTab = ref<TabKey>(AllOrderState.listState.QuanBu)

  const PAGE_SIZE = 8

  // ==================== 每个 Tab 的状态 ====================
  interface TabState {
    list: orderList_item[] // 已加载的订单
    page: number // 下一页请求页码
    hasMore: boolean // 是否还有更多
    loading: boolean // 是否正在请求
    loaded: boolean // 是否至少成功加载过一次
    refreshing: boolean // 是否正在下拉刷新
    reqId: number // 请求序号：拦截过期响应
    controller: SafeAbortControllerType | null // 请求控制器：主动中断
  }

  const tabStateMap = reactive<Record<number, TabState>>({})

  const getState = (key: number): TabState => {
    if (!tabStateMap[key]) {
      tabStateMap[key] = {
        list: [],
        page: 1,
        hasMore: true,
        loading: false,
        loaded: false,
        refreshing: false,
        reqId: 0,
        controller: null,
      }
    }
    return tabStateMap[key]
  }

  // 在 setup 层就把所有 Tab 的状态建好：模板不必靠可选链兜底，
  // 切 Tab 时也不会出现状态对象临时缺失的一帧
  orderTabs.forEach((t) => getState(t.key))

  // ==================== 气泡定位修复 ====================
  /**
   * wd-popover 只在 onMounted 里量一次 #target 的宽高，之后永久缓存（usePopover.ts:76）。
   * 首屏那一帧 wd-tabs 内部 activeIndex 还是 0（wd-tabs.vue:164），当前 tab 的
   * .wd-tab__body 带 display:none / height:0，于是量到 0 → left:0px; top:14px。
   * 这就是「首屏待评价错、切到全部再切回来就好」的原因：后者销毁重建 = 重新测量。
   *
   * 组件源码 102-107 行 watch(placement) → popover.init() 是它自带的重新测量入口。
   * 所以让气泡先以 'bottom' 挂载，等渲染层确认布局已落地后切成 'top'：
   *   1. 触发一次 init() 重新测量，覆盖首屏的错误缓存；
   *   2. 顺带改成向上弹，避开 scroll-view 底边对向下气泡的裁剪。
   * 不销毁实例、不改组件库、不靠 nextTick 猜帧数。
   */
  const popoverPlacement = ref<'bottom' | 'top'>('bottom')

  const MAX_MEASURE_RETRY = 10

  const refreshPopoverMeasure = (retry = 0) => {
    if (timer !== null) {
      clearTimeout(timer)
    }
    const query = uni.createSelectorQuery()
    query
      .select(`#scroll-area-${activeTab.value}`)
      .boundingClientRect((rect) => {
        const node = Array.isArray(rect) ? rect[0] : rect
        // 必须查「当前激活 tab」的容器，不能查任意一个可见容器：
        // 首屏那一帧 wd-tabs 内部激活的是第 0 个 tab，查全部会误判成已就绪。
        // display:none（activeIndex 未修正）或 height:0（scrollHeight 未注入）都会量到 0。
        if (Number(node?.height ?? 0) <= 0) {
          if (retry < MAX_MEASURE_RETRY) {
            timer = setTimeout(() => {
              refreshPopoverMeasure(retry + 1)
              timer = null
            }, 50)
            return
          }
          // 兜底：不再等，仍切一次 top 触发重测（至少修掉向下弹出被裁剪）
        }
        popoverPlacement.value = 'top'
      })
      .exec()
  }

  /**
   * 按 tabKey 取有效列表
   * 待付款：过滤掉倒计时已结束的订单
   * 其他：原样返回
   */
  const getEffectiveList = (tabKey: number): orderList_item[] => {
    const list = tabStateMap[tabKey]?.list ?? []
    if (tabKey === AllOrderState.orderState.DaiFuKuan) {
      return list.filter(
        (item) => getEffectiveOrderState(item) === AllOrderState.orderState.DaiFuKuan,
      )
    }
    return list
  }

  // ==================== 核心请求 ====================
  /**
   * 拉取订单列表
   *
   * 职责划分：
   * - AbortController：刷新 / 卸载时主动中断旧请求（真正取消网络传输）
   * - reqId：所有场景下拦截过期响应，并判断 finally 归属
   *
   * @param tabKey     Tab key（订单状态）
   * @param isRefresh  是否下拉刷新（会中断旧请求并重置分页）
   */
  const fetchOrders = async (tabKey: number, isRefresh = false) => {
    const s = getState(tabKey)

    // 非刷新模式：正在请求 或 已无更多 → 跳过（防止触底抖动）
    if (!isRefresh && (s.loading || !s.hasMore)) return

    // ✅ 刷新时：主动中断旧请求，真正取消网络传输
    //    加载更多 / 首次进入 不中断：追加语义，abort 反而像"数据丢了"
    if (isRefresh) {
      s.controller?.abort()
    }

    // ✅ reqId 自增：任何新请求都会让旧请求的响应失效
    const reqId = ++s.reqId
    const controller = new SafeAbortController()
    s.controller = controller

    const page = isRefresh ? 1 : s.page
    s.loading = true

    try {
      const params: orderList_Params = {
        page,
        pageSize: PAGE_SIZE,
        orderState: tabKey,
      }
      // ✅ 必须把信号透传到请求层，abort() 才会真正调用 requestTask.abort()
      const res = await reqOrderList(params, controller.signal)

      // ✅ 双重校验：
      //   - reqId 不匹配 → 已经有更新的请求，丢弃
      //   - controller 被 abort → 请求被主动中断，丢弃
      if (reqId !== s.reqId || controller.signal.aborted) return

      const newList = res.items ?? []
      s.list = isRefresh ? newList : [...s.list, ...newList]
      s.page = page + 1
      s.hasMore = newList.length > 0 && s.page <= Number(res.pages)
      s.loaded = true

      // 增加 有更多按钮的订单的气泡框 展示
      s.list.forEach((order) => (order.showMorePopover = false)) // 主动初始化，确保响应式追踪
    } catch (error) {
      // ✅ 只有"自己仍是最新请求"且"未被 abort"时才提示
      //    被 abort 的请求不进这里（abort 会 reject，但 reqId 已变）
      if (reqId === s.reqId && !controller.signal.aborted) {
        const title = orderTabs.find((t) => t.key === tabKey)?.title ?? tabKey
        console.warn(`订单列表请求失败 [${title}]:`, error)
        toast.error('加载失败')
      }
    } finally {
      // ✅ 只有"自己仍是最新请求"时才清理状态
      //    旧请求（被 abort 或被新请求覆盖）不清理，避免误清新请求的状态
      if (reqId === s.reqId) {
        s.loading = false
        s.refreshing = false
        s.controller = null
      }
    }
  }

  // ==================== 生命周期 ====================
  onLoad(async (options) => {
    if (options && options.orderState) {
      const targetStatus = Number(options.orderState) as TabKey
      if (orderTabs.some((item) => item.key === targetStatus)) {
        activeTab.value = targetStatus
        getState(activeTab.value)
      }
    }

    // getsafeArea() 在部分平台可能返回 null，不能强转后直接取 .bottom
    const insetArea = safeArea.getsafeArea()
    safeBottom.value = insetArea?.bottom ?? 0

    await fetchOrders(activeTab.value)
    pageLoading.value = false
    // 列表容器渲染出来后再量高度并注入 scroll-view
    await updateScrollHeight()
    // 布局落地后让 wd-popover 重新测量触发器尺寸，覆盖首屏隐藏态下的错误缓存
    refreshPopoverMeasure()
  })

  onUnload(() => {
    // ✅ 卸载时真正中断所有进行中的请求
    Object.values(tabStateMap).forEach((s) => s.controller?.abort())
    if (timer !== null) {
      clearTimeout(timer)
      timer = null //  清理后置空
    }
  })

  // =================== 待付款订单倒计时结束 =============
  const onCountdownFinish = (item: orderList_item) => {
    const list = tabStateMap[AllOrderState.orderState.DaiFuKuan]?.list ?? []
    const target = list.find((o) => o.id === item.id)
    if (target) {
      target.countdown = -1 // 触发 computed 重新过滤
      target.orderState = AllOrderState.orderState.YiQuXiao
    }
  }

  // ==================== 滚动 & 回顶 ====================
  // 各 Tab 的滚动位置快照（普通对象即可，不需要响应式）
  // const scrollPosMap: Record<number, number> = {}

  const onScrollLower = (key: number) => {
    if (key !== activeTab.value) return
    const s = getState(key)
    if (s.refreshing) return // 刷新进行中不追加分页
    fetchOrders(key) // 加载更多不 abort，靠 loading 防重复
  }

  const onScrollRefresh = async (key: number) => {
    const s = getState(key)
    // 兜底：只有真的停在顶部才允许刷新。
    // 即使原生把「底部轻微下拉」误判成顶部下拉，这里也会直接挡掉，不发请求。
    if (key !== activeTab.value || s.refreshing) {
      s.refreshing = false // 复位 refresher-triggered，让下拉动画收起
      return
    }
    s.refreshing = true
    await fetchOrders(key, true) // 刷新内部会 abort 旧请求
  }

  // 下拉未达阈值就松手 / 刷新被中止时，复位状态
  const onRefresherAbort = (key: number) => {
    getState(key).refreshing = false
  }

  // ==================== Tab 切换 ====================
  const onChangeTab = async ({ name }: { index: number; name: number }) => {
    const key = name as TabKey

    // 气泡因 v-if 销毁重建，重建后内部 showPopover 为 false，需同步复位外部状态
    Object.values(tabStateMap).forEach((s) => {
      s.list.forEach((order) => (order.showMorePopover = false))
    })

    // 切 Tab 不 abort 其他 Tab 的请求：让请求跑完，切回来命中缓存
    const s = getState(key)
    if (!s.loaded && !s.loading) {
      await fetchOrders(key)
    }
  }

  // ================ 前往订单详情页 =========
  const goOrderDetail = (orderId: string) => {
    if (!orderId) return
    uni.navigateTo({
      url: `/pages_order/orderDetail/orderDetail?id=${orderId}`,
    })
  }

  // ================ 按钮组中气泡框的内容 =========
  // 去评价的是什么订单id
  const comment_orderId = ref('')
  const onMenuClick = ({ item }: { item: PopoverMenuItem }, orderItem: orderList_item) => {
    if (item.content === '去评价') {
      showCommentPopup.value = true
      comment_orderId.value = orderItem.id
    } else if (item.content === '申请售后') {
      toast.show('等待开发')
    } else if (item.content === '查看物流') {
      uni.navigateTo({ url: `/pages_order/orderWuLiu/orderWuLiu?orderId=${orderItem.id}` })
    }
    orderItem.showMorePopover = false // 关闭当前气泡弹出框
  }

  // 点击去评价 评价完成后修改订单状态为已完成
  const orderStateToYiWanCheng = async (orderState: number) => {
    const target = tabStateMap[activeTab.value]?.list.find((o) => o.id === comment_orderId.value)
    if (!target) {
      toast.error('评价失败,请确认订单有效')
      return
    }
    target.orderState = orderState

    // await fetchOrders(activeTab.value, true)
  }

  // ================ 按钮组事件 ===========
  // 确认收货
  const onReceipt = (orderId: string) => {
    dialog.confirm({
      title: '确认收货',
      msg: '为了保障您的权益,请收到货并确认无误之后,再确认收货',
      theme: 'text',
      showClose: true,
      beforeConfirm: async () => {
        if (!orderId) return false
        toast.loading('确认中...')
        try {
          const res = await reqReceiptOrder(orderId)
          if (res.id) {
            await fetchOrders(activeTab.value, true)
            toast.success('确认收货成功')
            return true
          } else {
            toast.error('确认收货失败')
            return false
          }
        } catch (error) {
          console.warn(error)
          toast.error('确认收货失败')
          return false
        }
      },
    })
  }

  // 模拟支付
  // 开发环境模拟支付
  const onMockPay = async (item: orderList_item) => {
    if (timer !== null) {
      clearTimeout(timer)
    }
    if (!item.id) return
    if (item.mockPayLoading) return
    item.mockPayLoading = true
    try {
      await reqMockPay(item.id)
      toast.success('支付成功')
      item.orderState = AllOrderState.orderState.DaiFaHuo

      // 关闭当前页 再跳转
      timer = setTimeout(async () => {
        uni.navigateTo({
          url: `/pages_order/payment/payment?orderId=${item.id}`,
        })
        timer = null // ✅ 执行完毕后置空
      }, 800)
    } catch {
      toast.error('支付失败')
    } finally {
      item.mockPayLoading = false
    }
  }

  // 真实支付
  // 生产环境 真实支付
  const onPay = async (item: orderList_item) => {
    if (!item.id) return
    if (item.mockPayLoading) return
    item.mockPayLoading = true
    try {
      const res = await reqPay(item.id)
      // console.log(res)

      await uni.requestPayment({ ...res, provider: 'wxpay' })
      toast.success('支付成功')
      // 关闭当前页 再跳转
      uni.redirectTo({
        url: `/pages_order/Payment/Payment?orderId=${item.id}`,
      })
    } catch {
      toast.error('支付失败')
    } finally {
      item.mockPayLoading = false
    }
  }

  // 再次购买
  const onBuyAggin = async (orderId: string) => {
    if (!orderId) return
    uni.redirectTo({
      url: `/pages_order/order/order?orderId=${orderId}`,
    })
  }

  // 删除订单
  const onDelOrder = async (orderId: string) => {
    dialog.confirm({
      title: '删除订单',
      msg: '确定删除吗,删除之后将无法恢复',
      theme: 'text',
      showClose: true,
      beforeConfirm: async () => {
        if (!orderId) return false
        toast.loading('删除中...')
        try {
          await reqDelOrder([orderId])
          await fetchOrders(activeTab.value, true)
          toast.success('删除成功')
          // 如果在全部订单的状态中删除了一条 已完成的订单
          // 传key参数 - 就是更新这个订单状态的内容 而不是当前状态
          // 所以要传activeTab - 就是当前激活项的订单状态
          return true
        } catch {
          toast.error('删除失败')
          return false
        }
      },
    })
  }

  // =========== 取消订单 ============
  // 展示取消订单弹出层
  const showCancleOrderPopup = ref(false)
  const selectedReasonId = ref<number | null>(null) //选择的原因id
  // 确认取消订单按钮加载状态
  const SureCancelLoading = ref(false)
  // ============ 取消订单的原因 ==============
  const cancelReason = [
    { rid: 1, reason: '不想要了' },
    { rid: 2, reason: '地址或联系方式填写错误' },
    { rid: 3, reason: '选错商品(颜色/尺码/型号)' },
    { rid: 4, reason: '重复下单' },
    { rid: 5, reason: '发货太慢' },
    { rid: 6, reason: '质量问题' },
    { rid: 7, reason: '缺货' },
    { rid: 8, reason: '协商一致退款' },
    { rid: 9, reason: '其他原因' },
  ]

  // 记录取消的订单信息
  const cancelingOrder = ref<orderList_item | null>(null)
  // 点击取消订单按钮回调
  const onCancleOrder = (item: orderList_item) => {
    cancelingOrder.value = item
    selectedReasonId.value = null
    showCancleOrderPopup.value = true
  }

  // 点击选项 选择原因
  const handleSelect = (id: number) => {
    selectedReasonId.value = id
  }

  // 确认取消
  const handleConfirmCancel = async () => {
    const item = cancelingOrder.value
    if (!item) return
    // 状态前置校验（倒计时已结束的待付款订单同样不允许再取消）
    if (getEffectiveOrderState(item) !== AllOrderState.orderState.DaiFuKuan) {
      toast.warning('订单状态已变更,请刷新后重试')
      showCancleOrderPopup.value = false
      return
    }

    if (!selectedReasonId.value) {
      toast.show('请选择取消原因')
      return
    }

    if (SureCancelLoading.value) return
    SureCancelLoading.value = true
    toast.loading('加载中...')

    try {
      const reason = cancelReason.find((item) => item.rid === selectedReasonId.value)?.reason
      if (!item.id || !reason) {
        toast.close()
        toast.error('取消原因获取异常')
        return
      }

      await reqCancelOrder({ orderId: item.id, cancelReason: reason })
      // 暂停倒计时
      item.countdown = -1
      // 修改订单状态
      item.orderState = AllOrderState.orderState.YiQuXiao
      // 取消已经成功：先把 UI 收掉，再刷新列表
      toast.success('已取消订单')

      // 关闭弹出层
      showCancleOrderPopup.value = false
      // 重置数据
      cancelingOrder.value = null
      selectedReasonId.value = null

      // 刷新失败不影响"取消成功"这个结论，只当加载失败处理
      fetchOrders(activeTab.value, true).catch(() => {})
    } catch {
      toast.close()
      // 失败不关弹窗，保留 selectedReasonId 供用户重试
      toast.error('取消订单失败')
    } finally {
      SureCancelLoading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .page-loading {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .orderList {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;

    /* 不再依赖全局 page { height: 100% }（它会污染其他页面） */
    height: 100vh;

    :deep(.wd-tabs) {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }

    :deep(.wd-tabs__nav-item) {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }

    :deep(.wd-tabs__nav) {
      flex-shrink: 0;
    }

    :deep(.wd-tabs__body) {
      display: flex !important;
      flex-direction: column;
      overflow: hidden; /* 防止内部内容顶破 */
      flex: 1;
      min-height: 0;
    }

    .tab-content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;

      .tab-loading,
      .tab-empty {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #fff;
      }

      .scroll-area {
        /* 关键：高度由 :style 注入明确的 px。
           这里不能写 flex:1 —— 作为 flex item，主尺寸会被 flex-basis 覆盖，
           行内 height 形同虚设，滚动容器又会退化成「被内容撑开」。 */
        flex: none;
        flex-shrink: 0;
        width: 100%;

        .scroll-content {
          min-height: 100%;
          padding: 20rpx 0; /* 原 tab-content 的 padding 移到这里 */

          :deep(.wd-card) {
            overflow: visible;
          }

          :deep(.wd-card__title) {
            padding-bottom: 0;
          }

          :deep(.wd-card__content) {
            padding-top: 0;
          }

          .no-daiFuKuan-data {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }
    }

    .time-and-state {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .creat-time {
        color: #333;
        font-size: 30rpx;
        font-weight: normal;
      }

      .state {
        color: #444;

        /* 待付款 / 待评价 等待办状态用主题色强调 */
        &.state--pending {
          color: #e74c3c;
          font-weight: 500;
        }
      }
    }

    .loading-text {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20rpx;
      text-align: center;
      font-size: 28rpx;
      color: #999;
      padding-top: 20rpx;
    }

    .goods-section {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: stretch;
      background-color: #fff;
      padding: 0;

      .goods-item {
        display: flex;
        padding: 20rpx 0;

        &:last-child {
          border-bottom: none;
        }

        .goods-img {
          width: 180rpx;
          height: 180rpx;
          border-radius: 12rpx;
          background-color: #f0f0f0;
          margin-right: 24rpx;
          flex-shrink: 0;
        }

        .goods-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;

          .goods-title {
            font-size: 28rpx;
            color: #333;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .goods-spec {
            font-size: 24rpx;
            color: #999;
            margin-top: 8rpx;
          }

          .goods-price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16rpx;

            .price-wrap {
              display: flex;
              align-items: baseline;

              .symbol {
                font-size: 24rpx;
                color: #e74c3c;
              }

              .price {
                font-size: 32rpx;
                color: #e74c3c;
                font-weight: 500;
              }
            }

            .quantity {
              font-size: 28rpx;
              color: #333;
            }
          }
        }
      }

      .payMoney {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 20rpx;
      }

      .good-btn {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 20rpx;
        width: 100%;
        padding-top: 20rpx;
        border-top: 1rpx solid #f5f5f5;

        .del-order {
          flex: 1;
          display: flex;
          justify-content: start;
          align-items: center;

          .del-icon {
            width: 100rpx;
          }
        }

        :deep(.wd-button) {
          padding: 20rpx 40rpx;
        }
      }
    }
  }

  .backtop {
    position: fixed;
    right: 30rpx;
    bottom: 120rpx;
    z-index: 1000;
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background-color: rgb(0 0 0 / 45%);
    color: #fff;
    font-size: 36rpx;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgb(0 0 0 / 20%);
  }

  /* 取消订单弹出层 */
  .popup-container {
    display: flex;
    flex-direction: column;
    height: 100%; /* 撑满 popup 设定的 300px */
    background-color: #fff;

    .popup-header {
      padding: 20rpx 30rpx;
      text-align: center;
      border-bottom: 1px solid #f0f0f0;
      font-weight: bold;
      font-size: 32rpx;
      color: #333;
    }

    .popup-content {
      flex: 1; /* 占据剩余空间 */
      overflow-y: auto; /* 允许滚动 */
      padding: 10rpx 0;

      .reason-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24rpx 30rpx;
        font-size: 28rpx;
        color: #666;

        &.active {
          color: #1c64fd;
          font-weight: 600;
        }
      }
    }

    .popup-footer {
      background-color: #fff;
      box-shadow: 0 -2rpx 10rpx rgb(0 0 0 / 5%);
    }
  }
</style>
