<template>
  <view class="detail">
    <!-- 导航栏：使用 custom-left 插槽实现动态按钮 -->
    <wd-navbar
      :title="navTitle"
      @click-left="handleClickLeft"
      safe-area-inset-top
      fixed
      :z-index="1000"
      :left-arrow-color="progress > 0.5 ? '#333' : '#fff'"
      :custom-style="navBarStyle"
      :title-style="titleStyle"
    >
      <!-- 当不能返回时，显示首页图标 -->
      <template #left>
        <wd-icon name="left" size="48rpx" v-if="canGoBack"></wd-icon>
        <view class="home-icon-wrapper" @click="goHome" v-else>
          <wd-icon name="home" size="48rpx" :color="progress > 0.5 ? '#333' : '#fff'"></wd-icon>
        </view>
      </template>
    </wd-navbar>

    <wd-skeleton animation="gradient" :loading="isFristShow" :row-col="grid">
      <scroll-view
        :style="{ height: scrollHeight + 'px' }"
        scroll-with-animation
        enable-back-to-top
        refresher-enabled
        scroll-y
        :refresher-triggered="isRefresh"
        class="scroll-content"
        @scroll="onScroll"
        @refresherrefresh="onRefresh"
      >
        <view class="content" v-if="orderDetailInfo">
          <!-- ✅ 关键：这个区域就是"导航栏位置的背景颜色" -->
          <view class="header-bg"></view>
          <!-- 占位 -->
          <view style="height: 260rpx; display: flex; align-items: flex-end">
            <view style="width: 100%; flex-shrink: 0">
              <wd-notice-bar :text="textArray" color="#12b886" background-color="#f0f9eb" />
            </view>
          </view>

          <view class="content-body">
            <!-- 倒计时 -->
            <wd-card>
              <template #default>
                <view
                  class="countDowm"
                  v-if="
                    orderDetailInfo.countdown !== -1 &&
                    orderDetailInfo.orderState === orderStateEnum.DaiFuKuan
                  "
                >
                  <!-- 
                    orderDetailInfo.countdown 默认秒单位 且-1代表结束
                    组件默认单位毫秒 所以要改countdown单位 
                  -->
                  <!-- 场景 1：待付款 且 未超时（有倒计时） -->
                  <view class="countdown-body">
                    <text style="flex: 1">距离订单取消还剩:</text>
                    <wd-count-down
                      ref="countDown"
                      :time="(orderDetailInfo.countdown || 0) * 1000"
                      format="mm 分 ss 秒"
                      auto-start
                      @finish="onFinishConutDown"
                    />
                  </view>
                  <text>{{ currentOrderStatus.desc }}</text>
                </view>

                <!-- 场景 2：无倒计时（已取消、待发货、待收货、已完成、待评价） -->
                <view v-else class="statusInfo">
                  <text>{{ currentOrderStatus.desc }}</text>
                </view>
              </template>
            </wd-card>
            <!-- 物流 -->
            <view @click.stop="showWuLiuMap = !showWuLiuMap">
              <wd-card title="物流信息" custom-content-class="nopadding">
                <template #default>
                  <view class="wuLiu">
                    <wd-cell is-link value-align="left" @click="goOrderWuLiu">
                      <template #prefix>
                        <view
                          :style="{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: orderDetailInfo.orderState === 5 ? '#12b886' : '#000',
                          }"
                        >
                          <wd-icon
                            name="location"
                            size="40rpx"
                            :color="orderDetailInfo.orderState === 5 ? '#12b886' : '#333'"
                          ></wd-icon>
                          <text style="font-size: 24rpx">
                            {{ orderStateList[orderDetailInfo.orderState]?.text }}
                          </text>
                        </view>
                      </template>
                      <template #default>
                        <view class="wuLiu_content">
                          <!-- 收货人、地址信息 -->
                          <text>{{ orderDetailInfo.receiverContact }}</text>
                          <text style="margin: 0 10rpx">{{ orderDetailInfo.receiverMobile }}</text>
                          <text>{{ orderDetailInfo.receiverAddress }}</text>
                        </view>
                      </template>
                    </wd-cell>
                  </view>
                </template>
              </wd-card>
            </view>
            <!-- 商品 -->
            <wd-card>
              <template #default>
                <!-- 商品信息 列表 -->
                <view class="goods-section">
                  <view class="goods-item" v-for="item in goodList" :key="item.id">
                    <image class="goods-img" :src="item.image" mode="aspectFill" />
                    <view class="goods-info">
                      <view class="goods-title">{{ item.name }}</view>
                      <view class="goods-spec">{{ item.attrsText }}</view>
                      <view class="goods-price-row">
                        <view class="price-wrap">
                          <text class="symbol">￥</text>
                          <text class="price">{{ item.realPay }}</text>
                        </view>
                        <text class="quantity">x{{ item.quantity }}</text>
                      </view>
                    </view>
                  </view>
                  <!-- 按钮 -->
                  <view
                    class="good-btn"
                    v-if="
                      orderDetailInfo.orderState === orderStateEnum.DaiPingJia ||
                      orderDetailInfo.orderState === orderStateEnum.YiWanCheng
                    "
                  >
                    <wd-button round variant="plain" size="small" type="info">去评价</wd-button>
                    <wd-button round variant="plain" size="small">申请售后</wd-button>
                  </view>
                </view>
              </template>
            </wd-card>
            <!-- 价格 -->
            <wd-card>
              <template #default>
                <!-- 价格明细 -->
                <view class="price-detail-section">
                  <view class="price-row">
                    <text class="label">商品总价：</text>
                    <text class="value">￥ {{ orderDetailInfo?.totalMoney }}</text>
                  </view>
                  <view class="price-row">
                    <text class="label">运费：</text>
                    <text class="value">￥ {{ orderDetailInfo?.postFee }}</text>
                  </view>
                  <view class="price-row">
                    <text class="label">应付金额：</text>
                    <text class="value total-price">
                      <text style="font-size: 28rpx; margin-right: 4rpx">￥</text>
                      <text style="font-size: 40rpx">{{ orderDetailInfo?.payMoney }}</text>
                    </text>
                  </view>
                </view>
              </template>
            </wd-card>
          </view>
        </view>
      </scroll-view>
    </wd-skeleton>

    <!-- 底部提交栏 -->
    <view
      class="bottom-bar"
      :style="{ paddingBottom: safeInsets?.bottom ? `${safeInsets?.bottom}px` : `20rpx` }"
    >
      <!-- 按钮组 -->
      <view class="btn">
        <!-- 模拟商家发货 -->
        <wd-button
          round
          type="success"
          v-if="orderDetailInfo?.orderState === orderStateEnum.DaiFaHuo"
          @click="onMockOutput"
        >
          通知商家发货
        </wd-button>

        <!-- 再次购买 -->
        <wd-button
          round
          variant="plain"
          type="success"
          @click="onBuyAggin"
          v-if="orderDetailInfo?.orderState !== orderStateEnum.DaiFuKuan"
        >
          再次购买
        </wd-button>

        <!-- 删除订单 -->
        <wd-button
          type="danger"
          round
          variant="plain"
          v-if="
            orderDetailInfo?.orderState === orderStateEnum.DaiPingJia ||
            orderDetailInfo?.orderState === orderStateEnum.YiWanCheng ||
            orderDetailInfo?.orderState === orderStateEnum.YiQuXiao
          "
          @click="onDelOrder"
        >
          删除订单
        </wd-button>

        <!-- 取消订单 -->
        <wd-button
          type="info"
          round
          variant="plain"
          v-if="orderDetailInfo?.orderState === orderStateEnum.DaiFuKuan"
          @click="onCancleOrder"
        >
          取消订单
        </wd-button>

        <!-- 去支付 -->
        <wd-button
          :loading="payLoading"
          type="primary"
          round
          v-if="orderDetailInfo?.orderState === orderStateEnum.DaiFuKuan"
          @click="onMockPay"
        >
          模拟支付
        </wd-button>
        <!-- 真实支付 -->
        <wd-button :loading="payLoading" type="primary" round v-if="false" @click="onPay">
          去支付
        </wd-button>

        <!-- 确认收货 -->
        <wd-button
          type="primary"
          round
          v-if="orderDetailInfo?.orderState === orderStateEnum.DaiShouHuo"
          @click="onReceipt"
        >
          确认收货
        </wd-button>
      </view>
    </view>
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
            paddingBottom: safeInsets?.bottom ? `${safeInsets.bottom}` : '10' + 'px',
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

  <wd-toast cover :z-index="110"></wd-toast>
  <wd-dialog></wd-dialog>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue'
  import { onLoad, onUnload } from '@dcloudio/uni-app'
  import { useSafeArea } from '@/composables/useSafeArea'
  import { type orderDetail_skus, type orderDetail, orderStateEnum } from '@/api/order/type'
  import {
    reqOrderDetail,
    reqCancelOrder,
    reqMockConsignment,
    reqReceiptOrder,
    reqDelOrder,
  } from '@/api/order'
  import { reqPay, reqMockPay } from '@/api/pay'
  import { useToast, useDialog } from '@wot-ui/ui/composables'
  import type { CountDownInstance } from '@wot-ui/ui/components/wd-count-down/types'

  // 倒计时的 ref实例
  const countDown = ref<CountDownInstance>()

  const toast = useToast()
  const dialog = useDialog()

  // 安全区域
  const safeArea = useSafeArea()
  const safeInsets = ref<UniApp.SafeAreaInsets | null>(null)

  // 滚动区域的高度
  const scrollHeight = ref(0)

  // 导航栏标题 - 依靠订单的状态 计算得出
  // 根据返回值的订单状态 响应给页面导航栏标题
  const titleOverride = ref<string | null>(null)
  const navTitle = computed({
    get: () => {
      if (titleOverride.value !== null) return titleOverride.value
      return currentOrderStatus.value?.text
    },
    set: (newVal: string) => {
      titleOverride.value = newVal
    },
  })

  // 根据订单的返回值状态 再在orderStateList中 查找对应信息数据
  const currentOrderStatus = computed(() => {
    const state = orderDetailInfo.value?.orderState ?? 0
    return orderStateList[state] || { text: '订单详情', icon: 'info-circle', desc: '' }
  })

  // 当前页面栈 是否可以回到上一页
  const canGoBack = ref(true)
  // 存储当前订单id
  const orderId = ref<string | null>(null)

  // 骨架屏显示状态
  const isFristShow = ref(true)
  // 订单详情数据加载状态
  const loading = ref(false)
  // 确认取消订单按钮加载状态
  const SureCancelLoading = ref(false)
  // 支付按钮的加载状态
  const payLoading = ref(false)
  // 物流信息 组件
  const showWuLiuMap = ref(false)

  // 展示取消订单弹出层
  const showCancleOrderPopup = ref(false)
  const selectedReasonId = ref<number | null>(null)

  // ==========订单 - 商品模块==========
  // 商品信息
  // const isDiscount = ref(false)
  const goodList = ref<orderDetail_skus[]>([])
  // 没有skus 的数据
  const orderDetailInfo = ref<orderDetail | null>(null)

  // =========== 获取订单详情 ==========
  // force = true  → 业务强制刷新（支付成功、轮询确认等），绕过锁
  // force = false → 用户手动触发 / 生命周期触发，正常防抖
  const getOrderDetail = async (isforce = false) => {
    // 由于loading锁 会导致支付成功和订单超时轮询确认的请求被拒绝 所以要加上force强制刷新
    if (loading.value && !isforce) return
    toast.loading({
      position: 'middle',
      msg: '加载中...',
    })
    loading.value = true
    try {
      if (!orderId.value) {
        uni.showToast({ icon: 'error', title: '未获取到订单信息' })
        return
      }
      const res = await reqOrderDetail(orderId.value)
      console.log(res)
      console.log('刷新后 orderState =', res.orderState) // 排查用

      // 解构赋值
      const { skus, ...orderData } = res
      orderDetailInfo.value = orderData
      goodList.value = skus

      // 当倒计时结束时  (因为倒计时结束 后端返回值 orderState 依旧为1  所以要手动赋值)
      if (
        orderDetailInfo.value.countdown === -1 &&
        orderDetailInfo.value.orderState === orderStateEnum.DaiFuKuan
      ) {
        orderDetailInfo.value.orderState = orderStateEnum.YiQuXiao
      }
      return true
    } catch (error) {
      console.warn(error)
      return false
    } finally {
      loading.value = false
      toast.close()
      // 关闭骨架屏
      if (isFristShow.value) isFristShow.value = false
    }
  }

  // 页面加载 生命周期
  onLoad(async (options) => {
    // 获取当前页面栈
    const pages = getCurrentPages()
    // 页面栈长度为1表示当前是第一个页面，无法 navigateBack
    canGoBack.value = pages.length > 1

    // ==========获取当前设备的安全区域===========
    safeInsets.value = safeArea.getsafeArea()

    // ========== 计算滚动区域高度 ===============
    const sysInfo = uni.getSystemInfoSync()
    // 精确的底部高度
    const bottomBarHeight = uni.upx2px(140) // 根据你的 bottom-bar 实际高度调整
    scrollHeight.value = sysInfo.windowHeight - bottomBarHeight

    // ========== 获取跳转传递的订单id ===========
    if (options && options.id) {
      // 获取订单id
      orderId.value = String(options.id)
    }

    // =========== 请求获取订单详情 ===============
    await getOrderDetail()
  })

  // 倒计时结束时 回调
  const onFinishConutDown = async () => {
    orderDetailInfo.value!.countdown = -1
    await getOrderDetail(true)
    navTitle.value = currentOrderStatus.value.text
  }

  // ============= 底部按钮组的回调函数
  // 点击再次购买按钮回调
  const onBuyAggin = async () => {
    if (!orderId.value) return
    uni.redirectTo({
      url: `/pages_order/order/order?orderId=${orderId.value}`,
    })
  }

  // 模拟发货
  const isClickOutput = ref(false)
  const onMockOutput = async () => {
    if (!orderId.value) return
    if (isClickOutput.value) return
    isClickOutput.value = false
    try {
      const ok = await reqMockConsignment(orderId.value)
      if (!ok) {
        toast.show('商家正在积极备货,请稍等')
        return
      }

      // 关键：检查刷新后的状态是否真的变了
      if (orderDetailInfo.value?.orderState === orderStateEnum.DaiFaHuo) {
        // 还是待发货 → 后端状态没变（或延迟），提示用户重试
        toast.show('已通知发货,请耐心等待')
        return
      }
      toast.success('发货成功')
      await getOrderDetail(true)
    } catch (error) {
      toast.error('发货失败')
      console.warn(error)
    } finally {
      isClickOutput.value = true
    }
  }

  // 删除订单
  const onDelOrder = async () => {
    dialog.confirm({
      title: '删除订单',
      msg: '确定删除吗,删除之后将无法恢复',
      theme: 'text',
      showClose: true,
      beforeConfirm: async () => {
        if (!orderId.value) return false
        toast.loading('删除中...')
        try {
          await reqDelOrder([orderId.value])
          toast.success('删除成功')
          return true
        } catch {
          toast.error('删除失败')
          return false
        }
      },
    })
  }

  // 确认收货
  const onReceipt = () => {
    dialog.confirm({
      title: '确认收货',
      msg: '为了保障您的权益,请收到货并确认无误之后,再确认收货',
      theme: 'text',
      showClose: true,
      beforeConfirm: async () => {
        if (!orderId.value) return false
        toast.loading('确认中...')
        try {
          const res = await reqReceiptOrder(orderId.value)
          if (res.id) {
            orderDetailInfo.value = res
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

  // =========== 取消订单 ============
  // 点击取消订单按钮回调
  const onCancleOrder = () => {
    selectedReasonId.value = null
    showCancleOrderPopup.value = true
  }

  // 点击选项 选择原因
  const handleSelect = (id: number) => {
    selectedReasonId.value = id
  }

  // 确认取消
  const handleConfirmCancel = async () => {
    // 状态前置校验
    if (orderDetailInfo.value?.orderState !== orderStateEnum.DaiFuKuan) {
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
      if (orderId.value && reason) {
        const res = await reqCancelOrder({ orderId: orderId.value, cancelReason: reason })
        const { skus, ...orderData } = res
        orderDetailInfo.value = orderData
        // 取消页面的倒计时  在页面中使用v-if 当 orderDetailInfo.value.countdown === -1就渲染别的
        countDown.value?.pause()
        navTitle.value = currentOrderStatus.value.text

        toast.success('已取消订单')
        showCancleOrderPopup.value = false
      } else {
        toast.error('取消原因获取异常')
      }
    } catch {
      // 失败不关弹窗，保留 selectedReasonId 供用户重试
      toast.error('取消订单失败')
    } finally {
      SureCancelLoading.value = false
      toast.close()
    }
  }

  // ============ 支付操作 ===============
  // 定时器id
  let timer: ReturnType<typeof setTimeout> | null = null
  const isPay = ref(false)
  // 开发环境模拟支付
  const onMockPay = async () => {
    if (timer !== null) {
      clearTimeout(timer)
    }
    if (!orderId.value) return
    if (payLoading.value || isPay.value) return
    payLoading.value = true
    try {
      await reqMockPay(orderId.value)
      isPay.value = true // 表示订单已支付
      toast.success('支付成功')
      // 关闭当前页 再跳转
      timer = setTimeout(async () => {
        await uni.redirectTo({
          url: `/pages_order/payment/payment?orderId=${orderId.value}`,
        })
        timer = null // ✅ 执行完毕后置空
      }, 1000)
    } catch {
      toast.error('支付失败')
    } finally {
      payLoading.value = false
    }
  }

  // 重置数据+清空定时器
  onUnload(() => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null //  清理后置空
    }
    goodList.value = []
    orderDetailInfo.value = null
  })

  // 生产环境 真实支付
  const onPay = async () => {
    if (!orderId.value) return
    if (payLoading.value) return
    payLoading.value = true
    try {
      const res = await reqPay(orderId.value)
      // console.log(res)

      await uni.requestPayment({ ...res, provider: 'wxpay' })
      toast.success('支付成功')
      // 关闭当前页 再跳转
      uni.redirectTo({
        url: `/pages_order/Payment/Payment?orderId=${orderId.value}`,
      })
    } catch {
      toast.error('支付失败')
    } finally {
      payLoading.value = false
    }
  }

  // ============ 路由导航操作 ============
  // 前往首页
  const goHome = () => {
    // 根据项目路由配置选择 reLaunch 或 switchTab
    uni.switchTab({ url: '/pages/index/index' })
  }

  // 导航栏左侧返回
  const handleClickLeft = () => {
    if (canGoBack.value) {
      // 当前页面栈无页面 则去首页
      uni.navigateBack({ fail: () => goHome() })
    } else {
      goHome()
    }
  }

  // 前往物流页
  const goOrderWuLiu = () => {
    const canViewWuLiu =
      orderDetailInfo.value?.orderState === orderStateEnum.DaiShouHuo ||
      orderDetailInfo.value?.orderState === orderStateEnum.DaiPingJia ||
      orderDetailInfo.value?.orderState === orderStateEnum.YiWanCheng
    if (canViewWuLiu) {
      // 跳转
      uni.navigateTo({
        url: `/pages_order/orderWuLiu/orderWuLiu?orderId=${orderId.value}`,
      })
    }
    if (orderDetailInfo.value?.orderState === orderStateEnum.YiQuXiao) {
      toast.show('商品已取消')
    }
    if (orderDetailInfo.value?.orderState === orderStateEnum.DaiFaHuo) {
      toast.show('等待商家发货')
    }
    if (orderDetailInfo.value?.orderState === orderStateEnum.DaiFuKuan) {
      toast.show('请先完成付款')
    }
  }

  // ========== 2. 滚动渐变动画逻辑/滚动区域相关回调 ==========
  const scrollTop = ref(0)
  const THRESHOLD = 80 // 滚动多少px后导航栏完全变为不透明

  // 计算导航栏交互
  const onScroll = (e: any) => {
    scrollTop.value = e.detail.scrollTop
    if (!orderDetailInfo.value?.id) return
    if (scrollTop.value >= THRESHOLD) {
      navTitle.value = '订单详情'
    } else {
      navTitle.value = orderStateList[orderDetailInfo.value.orderState]?.text ?? '订单详情'
    }
  }

  // 下拉刷新
  // 是否开启下拉刷新
  const isRefresh = ref(false)
  const onRefresh = async () => {
    if (isRefresh.value) return
    isRefresh.value = true
    const ok = await getOrderDetail(true)
    if (!ok) {
      uni.showToast({ icon: 'none', title: '刷新失败' })
      return
    }
    isRefresh.value = false
  }

  // 动态导航栏
  // 计算进度 0 ~ 1
  const progress = computed(() => {
    return Math.min(Math.max(scrollTop.value / THRESHOLD, 0), 1)
  })
  // 动态样式：背景从透明渐变为白色
  const navBarStyle = computed(() => {
    return `background-color: rgba(255, 255, 255, ${progress.value}); transition: none;`
  })
  // 标题文字：白色 → 深色（跟随背景变化保证可读性）
  const titleStyle = computed(() => {
    const color = progress.value > 0.5 ? '#333' : '#ccc'
    return `color: ${color}; transition: none;`
  })

  // ============ 订单的状态列表 ===============
  interface StatusConfig {
    text: string
    desc: string
  }
  // 状态配置表：集中管理所有状态的 UI 表现
  const orderStateList: Record<number, StatusConfig> = {
    [orderStateEnum.DaiFuKuan]: {
      text: '待付款',
      desc: '请在倒计时结束前完成支付，超时订单将自动关闭',
    },
    [orderStateEnum.DaiFaHuo]: {
      text: '待发货',
      desc: '商家正在努力为您备货，请耐心等待',
    },
    [orderStateEnum.DaiShouHuo]: {
      text: '待收货',
      desc: '包裹正在飞奔向您，请注意查收',
    },
    [orderStateEnum.DaiPingJia]: {
      text: '待评价',
      desc: '商品已签收，快来分享您的使用体验吧',
    },
    [orderStateEnum.YiWanCheng]: {
      text: '已完成',
      desc: '交易成功，感谢您的购买',
    },
    [orderStateEnum.YiQuXiao]: {
      text: '已取消',
      desc: '订单已关闭，欢迎再次选购',
    },
  }

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

  // ============ 通知栏信息 ==================
  const textArray = ref([
    '限时秒杀: 全场数码配件低至5折, 抢购截至24:00',
    '新人专享: 注册即送188元优惠券礼包, 下单立减',
    '会员日预告: 每月8号积分兑好礼, 爆款1积分起兑',
    '价格保护: 购买后7天内降价可申请退差价, 放心买',
    '物流升级: 全场满69元包邮, 偏远地区除外',
    '满减狂欢: 跨店每满300减50, 上不封顶可叠加',
    '预售开启: 冬季新品提前订, 付定金尾款再减30',
    '售后无忧: 所有商品支持7天无理由退换+运费险',
    '销量榜单: 本周热销TOP10好物已更新, 点击速览',
    '客服在线: 工作时间9:00-22:00, 随时为您解答',
    '系统维护: 11月8日凌晨2:00-4:00升级, 请提前安排',
  ])

  // ============ 骨架屏静态占位 ===============
  const grid = [
    // 1. 顶部状态背景区（模拟 header-bg：状态图标 + 按钮 + 倒计时）
    { width: '100%', height: '300rpx', borderRadius: '0' },

    // 2. 物流信息卡片（模拟 wd-card + wd-cell：图标 + 地址多行文本）
    { width: '100%', height: '160rpx', borderRadius: '16rpx', marginTop: '20rpx' },

    // 3. 商品信息卡片（模拟 goods-section：图片+标题+规格+价格，预留2个商品高度）
    { width: '100%', height: '260rpx', borderRadius: '16rpx', marginTop: '20rpx' },

    // 4. 价格明细卡片（模拟 price-detail-section：3行价格信息）
    { width: '100%', height: '160rpx', borderRadius: '16rpx', marginTop: '20rpx' },
  ]
</script>

<style scoped lang="scss">
  .detail {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .home-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50rpx;
    height: 50rpx;
  }

  .scroll-content {
    flex: 1;
    min-height: 0;

    .content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;

      .header-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 440rpx;
        background: url('../../static/images/center_bg.png') no-repeat;
        background-size: cover;
      }

      .content-body {
        padding: 40rpx 20rpx 100rpx;
        height: 100vh;

        :deep(.wd-card) {
          margin: 0 20rpx 20rpx;
        }

        :deep(.nopadding) {
          padding: 0;
        }

        // 倒计时
        .countDowm {
          display: flex;
          flex-direction: column;
          justify-content: start;
          align-items: flex-start;
          width: 100%;
          font-size: 30rpx;

          .countdown-body {
            display: flex;
            align-items: center;
            gap: 10rpx;
            font-weight: 600;
            :deep(.wd-count-down) {
              font-size: 30rpx;
            }
          }
        }

        // 无倒计时 的时候
        .statusInfo {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
          font-size: 30rpx;
          color: #333;
        }

        /**物流 */
        .wuLiu {
          :deep(.wd-cell) {
            padding-top: 0;
          }
          :deep(.wd-cell__left) {
            flex: unset;
          }
          :deep(.wd-cell__wrapper) {
            align-items: center;
          }

          .wuLiu_content {
            font-size: 28rpx;
            color: #333;
            line-height: 1.4;
            margin-left: 16rpx;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        /* 商品列表 */
        .goods-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
          gap: 20rpx;
          background-color: #fff;
          padding: 0;

          .goods-item {
            display: flex;
            padding: 20rpx 0 20rpx;

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
        }

        // 商品卡片 按钮组
        .good-btn {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 20rpx;
          width: 100%;
          padding-top: 20rpx;
          border-top: 1rpx solid #f5f5f5; /* 极细边框用 1rpx */

          :deep(.wd-button) {
            padding: 20rpx 40rpx;
          }
        }

        /* 价格明细 */
        .price-detail-section {
          background-color: #fff;
          font-size: 28rpx;

          .price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20rpx;

            &:last-child {
              margin-bottom: 0;
            }

            .label {
              color: #333;
            }

            .value {
              color: #333;
              font-weight: 500;
            }

            .total-price {
              color: #e74c3c;
              font-weight: 600;
            }
          }
        }
      }
    }
  }

  /* 底部提交栏 */
  .bottom-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    z-index: 1;
    width: 100%;
    height: 140rpx;
    box-sizing: border-box;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);

    .btn {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 20rpx;
      padding: 20rpx 30rpx 0;
    }

    :deep(.wd-button) {
      padding: 20rpx 60rpx;
    }
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
      box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    }
  }
</style>
