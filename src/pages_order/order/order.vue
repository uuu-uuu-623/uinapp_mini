<template>
  <!-- 数据加载中 -->
  <view v-if="loading" class="loading-state">
    <wd-loading size="48rpx" text="加载中..." />
  </view>
  <view v-else class="order-container">
    <!-- 页面内容区 -->
    <view class="page-content">
      <!-- 收货地址 -->
      <view class="address-section">
        <wd-cell-group border>
          <wd-cell
            v-if="!selectedAddress?.id && !defaultAddress?.id"
            is-link
            center
            to="/pages_member/address/address?fromUrl=order"
          >
            <template #prefix>
              <view class="location-icon-wrap">
                <wd-icon name="location" size="40rpx" color="#333333" />
              </view>
            </template>
            <template #title>
              <text class="address-text">请选择收货地址</text>
            </template>
          </wd-cell>
          <wd-cell
            v-else
            value-align="left"
            center
            is-link
            to="/pages_member/address/address?fromUrl=order"
          >
            <template #default>
              <view style="display: flex; justify-content: left; align-items: center; width: 100%">
                <view class="location-icon-wrap">
                  <wd-icon name="location" size="40rpx" color="#333333" />
                </view>
                <view class="addressBox">
                  <view class="consignee">
                    <text style="margin-right: 8rpx">
                      {{ selectedAddress?.receiver || defaultAddress?.receiver }}
                    </text>
                    <text>
                      {{ selectedAddress?.contact || defaultAddress?.contact }}
                    </text>
                  </view>
                  <view class="addressBar">
                    <text class="addressBar-text">
                      {{ selectedAddress?.fullLocation || defaultAddress?.fullLocation }}
                      {{ selectedAddress?.address || defaultAddress?.address }}
                    </text>
                  </view>
                </view>
              </view>
            </template>
          </wd-cell>
        </wd-cell-group>
      </view>

      <!-- 商品列表 -->
      <view class="goods-section">
        <view class="goods-item" v-for="item in goodList" :key="item.skuId">
          <image class="goods-img" :src="item.picture" mode="aspectFill" />
          <view class="goods-info">
            <view class="goods-title">{{ item.name }}</view>
            <view class="goods-spec">{{ item.attrsText }}</view>
            <view class="goods-price-row">
              <view class="price-wrap">
                <text class="symbol">￥</text>
                <text class="price">{{ item.payPrice }}</text>
                <text class="original-price" v-show="isDiscount">￥{{ item.price }}</text>
              </view>
              <text class="quantity">x{{ item.count }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="order-info-section">
        <wd-cell-group border>
          <wd-cell
            title="配送时间"
            :value="deliveryLabel"
            is-link
            @click="deliveryPopup = true"
            value-align="left"
          />
          <wd-cell title="订单备注" value-align="left">
            <template #default>
              <wd-textarea
                v-model="inputValue"
                type="text"
                placeholder="选填，建议留言前先与商家沟通确认"
                custom-class="remark-placeholder"
                focus-when-clear
                clearable
                clear-trigger="focus"
                :maxlength="200"
                show-word-limit
                :min-height="80"
                :max-height="200"
                auto-height
              />
            </template>
          </wd-cell>
        </wd-cell-group>
      </view>

      <!-- 价格明细 -->
      <view class="price-detail-section" v-if="orderFee">
        <view class="price-row">
          <text class="label">商品总价：</text>
          <text class="value">￥ {{ orderFee?.totalPrice.toFixed(2) }}</text>
        </view>
        <view class="price-row">
          <text class="label">运费：</text>
          <text class="value">￥ {{ orderFee?.postFee }}</text>
        </view>
      </view>
    </view>

    <!-- 底部提交栏 -->
    <view
      v-show="deliveryPopup === false"
      class="bottom-bar"
      :style="{ paddingBottom: safeAreainsets?.bottom ? `${safeAreainsets?.bottom}px` : `20rpx` }"
    >
      <view class="total-price">
        <text class="symbol">￥</text>
        <text class="price">{{ orderFee?.totalPayPrice.toFixed(2) }}</text>
      </view>
      <wd-button
        type="primary"
        custom-class="submit-btn"
        round
        :disabled="!selectedAddress?.id && !defaultAddress?.id"
        :loading="submitLoading"
        @click="submitOrder"
      >
        提交订单
      </wd-button>
    </view>

    <!-- 占位，防止底部内容被底部栏遮挡 -->
    <view class="safe-area-bottom"></view>
  </view>

  <wd-picker
    :columns="deliveryList"
    v-model="deliveryType"
    v-model:visible="deliveryPopup"
    value-key="type"
    label-key="text"
    safe-area-inset-bottom
    immediate-change
    @confirm="onConfirmPicker"
  />

  <!-- 消息通知 -->
  <wd-notify />
  <!-- 加载 -->
  <wd-toast cover />
</template>

<script setup lang="ts">
  import { ref, computed, toRefs } from 'vue'
  import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
  import { useSafeArea } from '@/composables/useSafeArea'
  import { reqPreOrder, reqPreOrderBuyNow, reqsubmitOrder, reqBuyAgginOrderData } from '@/api/order'
  import type {
    userAddress,
    good,
    summary,
    PreOrder_BuyNowParams,
    PreOrderData,
    submitOrder_Params,
  } from '@/api/order/type'
  import { useAddressStore } from '@/stores/modules/address'
  import { useToast, useNotify } from '@wot-ui/ui/composables'

  const toast = useToast()
  // 消息通知
  const { showNotify } = useNotify()

  // 地址相关仓库
  const addressStore = useAddressStore()
  const { selectedAddress } = toRefs(addressStore)

  const safeAreahook = useSafeArea()
  const safeAreainsets = ref<UniApp.SafeAreaInsets>()

  // 预付订单信息加载状态
  const loading = ref(false)
  // 提交订单按钮加载状态
  const submitLoading = ref(false)

  interface delivery {
    type: number
    text: string
  }
  // 配送时间
  const deliveryList = ref<delivery[]>([
    { type: 1, text: '时间不限 (周一至周日)' },
    { type: 2, text: '工作日送 (周一至周五)' },
    { type: 3, text: '周末配送 (周六至周日)' },
  ])
  // 配送时间弹出层
  const deliveryPopup = ref(false)
  // 选择器 绑定的值
  const deliveryType = ref<number[]>([1])
  // 单独存储展示文本（可选，若模板中需要显示文字）
  const deliveryLabel = ref<string>('时间不限 (周一至周日)')

  // 用户地址
  // const addressList = ref<userAddress[]>([])
  // 预付的订单商品
  const goodList = ref<good[]>([])
  // 订单的费用
  const orderFee = ref<summary | null>(null)

  // 用户的默认地址
  const defaultAddress = ref<userAddress | null>(null)

  // 请求获取立即购买数据的请求参数
  const buyNowParams = ref<PreOrder_BuyNowParams>({
    // skuId
    skuId: '',
    // 购买商品的数量
    count: '',
    // 下单时已经选择好的地址id
    addressId: '',
  })

  // 双向绑定订单备注输入框的值
  const inputValue = ref<string>('')

  // 从订单详情页跳转携带的订单id (再次购买的订单)
  const buyAggin_orderId = ref<string>('')

  // 请求提交订单的 请求参数
  const submitParams = ref<submitOrder_Params>({
    goods: [],
    // 所选地址Id
    addressId: '',
    // 配送时间类型，1为不限，2为工作日，3为双休或假日
    deliveryTimeType: 1,
    // 支付方式，1为在线支付，2为货到付款
    payType: 1,
    // 支付渠道，1支付宝、2微信 --支付方式为在线支付时，传值，为货到付款时，不传值
    payChannel: 2,
    // 买家留言
    buyerMessage: '',
  })

  // 获取预付订单信息
  const getPreOrder = async () => {
    // 如果是立即购买跳转过来的 则有参数  如果是购物车直接结算则没有参数
    if (loading.value) return
    loading.value = true
    try {
      let res: PreOrderData
      if (buyNowParams.value.skuId && Number(buyNowParams.value.count) > 0) {
        // 如果有跳转参数 则发送获取立即购买订单请求
        res = await reqPreOrderBuyNow(buyNowParams.value)
      } else if (buyAggin_orderId.value) {
        // 如果有从订单详情页 跳转携带的订单id (再次购买的订单)
        // 发送再次购买的请求
        res = await reqBuyAgginOrderData(buyAggin_orderId.value)
      } else {
        // 没有跳转参数 则发送获取用户在购物车中选择的预付订单数据
        res = await reqPreOrder()
        console.log(res)
      }
      // addressList.value = res.userAddresses
      orderFee.value = res.summary
      goodList.value = res.goods

      // 无论用户是否在地址管理页选择与否 都要查找默认地址
      // 查找默认地址
      const newDefault = res.userAddresses.find((item) => item.isDefault === 1) ?? null
      if (newDefault) {
        // 如果用户本身有默认地址或者修改了新的默认地址 则赋值给 defaultAddress
        defaultAddress.value = newDefault
      } else if (!defaultAddress.value?.id) {
        // 如果本来没有默认地址 或者修改了原本默认地址
        // 取第一个兜底或置空，避免显示过期默认地址
        defaultAddress.value = res.userAddresses[0] ?? null
      }
    } catch (error) {
      console.log(error)
      // 请求失败 重置数据
      // addressList.value = []
      goodList.value = []
      defaultAddress.value = null // 失败时也要清空
      orderFee.value = null
    } finally {
      loading.value = false
    }
  }

  // onShow 仅在非首次显示时刷新（例如从地址页返回）
  // - 做更新使用
  const isFirstShow = ref(true)
  onShow(() => {
    if (isFirstShow.value) {
      isFirstShow.value = false
      return
    }
    // 仅在地址可能变更时刷新，可加条件判断
    getPreOrder()
  })

  onLoad(async (options) => {
    // 获取在商品详情页跳转传递的参数
    if (options && options.skuId) {
      Object.assign(buyNowParams.value, { ...options })
    }
    if (options && options.orderId) {
      buyAggin_orderId.value = options.orderId
    }
    safeAreainsets.value = safeAreahook.getsafeArea() as UniApp.SafeAreaInsets
    await getPreOrder()
  })

  // 商品是否有折扣
  const isDiscount = computed(() => {
    if (!orderFee.value) return false
    if (orderFee.value.discountPrice > 0) return true
    else return false
  })

  // 点击picker 完成按钮触发
  const onConfirmPicker = ({
    value,
    selectedItems,
  }: {
    value: number[]
    selectedItems: delivery[]
  }) => {
    // console.log(value, selectedItems)
    // value 是在组件中绑定的key(type) selectedItems是选中的对象
    deliveryType.value = value // 回写 v-model，保证下次打开回显正确
    deliveryLabel.value = selectedItems[0]?.text ?? '' // 更新展示文本
  }

  const submitOrder = async () => {
    if (goodList.value.length === 0) {
      toast.error('请选择商品,再结算')
      return
    }
    if (submitLoading.value) return
    submitLoading.value = true
    toast.loading({
      msg: '加载中...',
      loadingType: 'circular',
      position: 'middle',
    })
    try {
      // 收集参数
      Object.assign(submitParams.value, {
        addressId: (selectedAddress.value?.id || defaultAddress.value?.id) ?? '',
        deliveryTimeType: deliveryType.value[0] ?? 1,
        payType: 1, //写死
        payChannel: 2, //写死
        buyerMessage: inputValue.value ?? '',
        goods: goodList.value.map((item) => {
          return { count: Number(item.count), skuId: item.skuId }
        }),
      })

      if (!submitParams.value.addressId) {
        showNotify({ type: 'warning', message: '请选择地址', closable: true, duration: 2000 })
        return
      }

      // 发送请求
      const res = await reqsubmitOrder(submitParams.value)
      if (res.id) {
        // 关闭当前页面 跳转到商品详情页 携带订单id
        uni.redirectTo({
          url: `/pages_order/orderDetail/orderDetail?id=${res.id}`,
        })
      }
    } catch {
      uni.showToast({ icon: 'none', title: '提交失败' })
    } finally {
      submitLoading.value = false
      toast.close()
    }
  }

  onUnload(() => {
    // 清除数据
    addressStore.resetData()
    // 重置请求参数
    Object.assign(buyNowParams.value, {
      skuId: '',
      count: '',
      addressId: '',
    })
    Object.assign(submitParams.value, {
      goods: [],
      // 所选地址Id
      addressId: '',
      // 配送时间类型，1为不限，2为工作日，3为双休或假日
      deliveryTimeType: 1,
      // 支付方式，1为在线支付，2为货到付款
      payType: 1,
      // 支付渠道，1支付宝、2微信 --支付方式为在线支付时，传值，为货到付款时，不传值
      payChannel: 2,
      // 买家留言
      buyerMessage: '',
    })
  })
</script>

<style scoped lang="scss">
  .loading-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 30rpx;
    width: 100%;
    height: 80vh;
    color: #333;
  }

  .order-container {
    min-height: 100vh;
    background-color: #f8f8f8;
    padding-bottom: 200rpx; /* 留出底部栏高度 (120rpx + 边距) */
    box-sizing: border-box;
  }

  .page-content {
    padding-top: 20rpx;
  }

  /* 地址区域 */
  .address-section {
    margin-bottom: 20rpx;

    :deep(.wd-cell__left) {
      align-items: baseline;
    }

    .location-icon-wrap {
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16rpx;
    }

    .address-text {
      font-size: 30rpx;
      color: #333;
      font-weight: 500;
    }

    // 地址相关
    .addressBox {
      display: flex;
      flex-direction: column;
      gap: 20rpx;
      min-width: 0;

      // 收货人
      .consignee {
        display: flex;
        align-items: center;
        gap: 26rpx;
        font-size: 32rpx;
        color: #333;
      }

      // 地址栏
      .addressBar {
        min-width: 0;
        width: 100%;

        .addressBar-text {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-all;
          font-size: 28rpx;
          color: #837d7d;
        }
      }
    }
  }

  /* 商品列表 */
  .goods-section {
    background-color: #fff;
    padding: 0 30rpx;
    margin-bottom: 20rpx;

    .goods-item {
      display: flex;
      padding: 30rpx 0;
      border-bottom: 1rpx solid #f5f5f5; /* 极细边框用 1rpx */

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

            .original-price {
              font-size: 24rpx;
              color: #999;
              text-decoration: line-through;
              margin-left: 16rpx;
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

  /* 订单信息 */
  .order-info-section {
    margin-bottom: 20rpx;

    /* 深度选择器覆盖 wot-ui 内部样式 */
    :deep(.wd-cell__left) {
      flex: none !important;
      width: 160rpx !important; /* 根据实际标题长度调整 */
      align-self: flex-start !important;
    }

    :deep(.wd-cell__body) {
      flex: 1 !important;
      min-width: 0 !important;
      align-items: flex-start !important; /* 关键：改为顶部对齐 */
    }

    :deep(.remark-placeholder) {
      padding: 0;
      width: 100% !important;
      font-size: 26rpx;
      color: #999;
    }
  }

  /* 价格明细 */
  .price-detail-section {
    background-color: #fff;
    padding: 30rpx;
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
    }
  }

  /* 底部提交栏 */
  .bottom-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;

    // height: 120rpx;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 30rpx 0;
    box-sizing: border-box;
    box-shadow: 0 -4rpx 20rpx rgb(0 0 0 / 5%);
    z-index: 1;

    .total-price {
      display: flex;
      align-items: baseline;

      .symbol {
        font-size: 28rpx;
        color: #e74c3c;
        margin-right: 4rpx;
      }

      .price {
        font-size: 40rpx;
        color: #e74c3c;
        font-weight: 600;
      }
    }

    /* 深度选择器覆盖按钮样式 */
    :deep(.submit-btn) {
      font-size: 30rpx;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx 40rpx;
    }
  }

  .safe-area-bottom {
    height: env(safe-area-inset-bottom);
  }
</style>
