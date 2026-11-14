<template>
  <view
    class="cart"
    :style="{ paddingBottom: userStore.token && cartList.length > 0 ? '100rpx' : 0 }"
  >
    <scroll-view
      class="scroll-area"
      scroll-y
      scroll-with-animation
      enable-back-to-top
      @scrolltolower="scrollToLower"
    >
      <view class="unLogin" v-if="!userStore.token">
        <text>请登陆后查看</text>
        <wd-button icon="arrow-right" round custom-class="custom-shadow" @click="ToLogin">
          去登陆
        </wd-button>
      </view>

      <view v-else class="cartInfo">
        <!-- 顶部提示信息 -->
        <view class="tips-bar">
          <!-- 左侧：满减提示 -->
          <view class="tips-left">
            <wd-tag variant="light" color="#0083ff">满减</wd-tag>
            <text class="tips-text">满3件,即可享受8折优惠</text>
          </view>
          <!-- 右侧：多选删除 -->
          <view @click="DelSelectedGoods">
            <text class="delete-text">批量删除</text>
          </view>
        </view>

        <!-- 首次加载中 -->
        <view v-if="loading" class="loading-state">
          <wd-loading size="48rpx" />
          <text class="loading-text">加载中...</text>
        </view>

        <!-- 当购物车为空 -->
        <view v-else-if="cartList.length === 0" class="empty-state">
          <wd-icon name="cart" size="120rpx" color="#ccc" />
          <text>购物车空空如也，快去逛逛吧</text>
          <wd-button type="primary" round @click="toIndex">去购物</wd-button>
        </view>

        <view @click="closeOutside" v-else>
          <wd-swipe-action v-for="item in cartList" :key="item.skuId">
            <template #default>
              <view class="goods-card" @click="ToGoodDetail(item)">
                <!-- 左侧：勾选框 + 商品图片 -->
                <view class="goods-left">
                  <!-- 给单选框套一个盒子 繁殖事件冒泡 -->
                  <view @click.stop style="display: flex">
                    <wd-checkbox
                      :disabled="isLoading(item.skuId)"
                      v-model="item.checked"
                      @change="onChangeCheckBox(item)"
                    ></wd-checkbox>
                  </view>
                  <view
                    class="img-wrap"
                    :class="{ 'is-invalid': !item.isEffective || !(item.stock > 0) }"
                  >
                    <wd-img
                      :src="item.picture"
                      width="200rpx"
                      height="200rpx"
                      image-mode="aspectFit"
                      lazy-load
                      fade-show
                    ></wd-img>
                    <text v-if="!item.isEffective" class="invalid-tag">已失效</text>
                    <text v-else-if="!(item.stock > 0)" class="invalid-tag">无库存</text>
                  </view>
                </view>

                <!-- 右侧：商品信息 -->
                <view
                  class="goods-right"
                  :class="{ 'is-invalid': !item.isEffective || !(item.stock > 0) }"
                >
                  <view class="goods-name">{{ item.name }}</view>
                  <view class="goods-desc">{{ item.attrsText }}</view>
                  <view class="goods-bottom">
                    <view class="goods-price">
                      <text class="iconPrice">￥</text>
                      <text class="current-price">{{ item.nowPrice || item.price }}</text>
                      <!-- 2. 当存在折扣价且与原价不同时，展示带删除线的原价 -->
                      <text
                        v-if="item.nowPrice && item.nowPrice !== item.price"
                        class="original-price"
                      >
                        ￥{{ item.price }}
                      </text>
                    </view>
                    <view @click.stop>
                      <wd-input-number
                        v-model="item.chooseNum"
                        :min="item.stock && item.stock > 0 ? 1 : 0"
                        :max="item.stock && item.stock > 0 ? item.stock : 0"
                        :disabled="isLoading(item.skuId) || !item.isEffective || !(item.stock > 0)"
                        @change="onChangeInputNum(item)"
                      />
                    </view>
                  </view>
                </view>
              </view>
            </template>
            <template #right>
              <view class="action">
                <view class="button" style="background: #e2231a" @click="onDelOneCart(item.skuId)">
                  删除
                </view>
              </view>
            </template>
          </wd-swipe-action>
        </view>
      </view>

      <XtxGuessLike ref="guessLikeRef"></XtxGuessLike>

      <!-- 底部盒子 -->
      <view
        v-if="userStore.token && cartList.length > 0"
        class="toolbar"
        :style="{
          paddingBottom: p.safeAreaBottom ? `${p.safeAreaBottom}px` : `20rpx`,
        }"
      >
        <view class="allAndPrice">
          <view>
            <wd-checkbox v-model="checkedAll" @change="onChangeAll" custom-style="font-size: 28rpx">
              全选
            </wd-checkbox>
          </view>
          <view class="totalPrice">
            <text style="margin-right: 16rpx; font-size: 28rpx">合计:</text>
            <text class="iconPrice">￥</text>
            <text class="current-price">{{ totalPrice }}</text>
          </view>
        </view>
        <view class="check-out">
          <wd-button round size="small" @click="ToOrder">
            去结算({{ collectSelectedSkuIdList.length }})
          </wd-button>
        </view>
      </view>
    </scroll-view>
  </view>

  <wd-dialog></wd-dialog>
  <wd-toast />
</template>

<script lang="ts" setup>
  import { useUserStore } from '@/stores/modules/user'
  import { ref, computed } from 'vue'
  import { onShow } from '@dcloudio/uni-app'
  import { useToast, useQueue, useDialog } from '@wot-ui/ui/composables'
  import XtxGuessLike from '@/components/XtxGuessLike/XtxGuessLike.vue'
  import type { CartList } from '@/api/cart/type'
  import { reqCartList, reqDelCart, reqUpdateCart, reqCartCheckedAll } from '@/api/cart'

  // 获取父组件cart2 传来的底部安全区域
  const p = defineProps<{ safeAreaBottom?: number }>()

  const { closeOutside } = useQueue()
  const toast = useToast()
  const dialog = useDialog()

  // 页面的请求状态-获取购物车信息
  const loading = ref(false)
  // 按 SKU 粒度加锁，避免全局锁导致操作排队
  const loadingSkuIds = ref(new Set<string>())
  const isLoading = (skuId: string) => loadingSkuIds.value.has(skuId)

  const userStore = useUserStore()

  // 猜你喜欢组件的ref
  const guessLikeRef = ref<InstanceType<typeof XtxGuessLike>>()

  // 用于存储 购物车信息
  const cartList = ref<CartList[]>([])

  // 全选状态
  const checkedAll = computed({
    get: () => {
      // 只要有效的商品全选了 那么全选按钮就为true
      // 1.筛选有效商品
      const effectiveShops = cartList.value.filter((item) => item.stock > 0 && item.isEffective)
      // 2.存在有效商品 并且全选有效商品
      const AllIsTrue = effectiveShops.length > 0 && effectiveShops.every((item) => item.checked)
      if (AllIsTrue) return true
      else return false
    },
    // 在changeAll中 做修改逻辑
    set: () => {},
  })

  // 计算全部已选商品的价格
  const totalPrice = computed(() => {
    if (!cartList.value.length) return 0
    const fen = cartList.value
      .filter((i) => i.checked)
      .reduce((sum, i) => {
        const price = Math.round((i.nowPrice ?? i.price) * 100)
        return sum + price * i.chooseNum
      }, 0)
    return (fen / 100).toFixed(2)
  })

  // 收集页面中用户选中的商品
  const collectSelectedSkuIdList = computed(() => {
    return cartList.value.filter((i) => i.checked && i.chooseNum > 0).map((i) => i.skuId)
  })

  // 请求获取 用户的购物车信息
  const getCartInfo = async () => {
    if (loading.value) return
    loading.value = true
    try {
      const res = await reqCartList()
      // 获取数据
      cartList.value = (res ?? []).map((i) => {
        const num = i.count ?? 1
        return {
          ...i,
          checked: i.selected ?? false,
          chooseNum: num,
          lastChooseNum: num, // 初始基准
        }
      })
    } catch {
      console.log('获取购物车信息失败')
    } finally {
      loading.value = false
    }
  }

  // 页面显示时
  onShow(() => {
    if (userStore.token) getCartInfo()
    else cartList.value = []
  })

  // 触底加载
  const scrollToLower = () => {
    guessLikeRef.value?.loadingMore()
  }

  const ToLogin = () => {
    uni.navigateTo({
      url: '/pages/login/login',
    })
  }

  const toIndex = () => {
    uni.switchTab({
      url: '/pages/index/index',
    })
  }

  // 点击商品的 回调函数
  const ToGoodDetail = (cart: CartList) => {
    if (isLoading(cart.skuId) || !cart.isEffective || !(cart.stock > 0)) return
    uni.navigateTo({
      url: `/pages/goods/goods?id=${cart.id}`,
    })
  }

  // 点击单选框的回调函数
  const onChangeCheckBox = async (cart: CartList) => {
    // 第二次快速点击时直接 return，
    // 但 cart.checked 已被 v-model 改掉，导致 UI 与服务器状态不一致。
    if (isLoading(cart.skuId)) {
      cart.checked = !cart.checked //回滚回滚状态
      return
    }
    loadingSkuIds.value.add(cart.skuId)
    // 取反是为了存储旧值 因为这是change触发的函数
    const prevChecked = !cart.checked // 存储旧值
    try {
      await reqUpdateCart(cart.skuId, { selected: cart.checked })
    } catch {
      cart.checked = prevChecked // 失败回滚到旧值
      uni.showToast({ title: '操作失败，请重试', icon: 'none' })
    } finally {
      loadingSkuIds.value.delete(cart.skuId)
    }
  }

  // 改变全选框的回调函数
  const onChangeAll = async () => {
    // 先改页面ui  再发请求
    // 没有商品则return
    if (!cartList.value.length) {
      toast.warning('当前购物车没有商品,快去购物吧')
      return
    }

    const target = !checkedAll.value // 当前是否全选 → 取反即目标
    // 程序化修改 item.checked 不会触发 @change   因为@change 是用户交互事件
    cartList.value.forEach((item) => (item.checked = target))
    // 记录上一次的 所有商品的单选框状态  方便失败回滚
    // 改为先记录再修改：
    const prevChecked = cartList.value.map((i) => i.checked)
    cartList.value.forEach((item) => (item.checked = target))

    // 所以要发请求 全选/取消全选
    try {
      await reqCartCheckedAll(checkedAll.value)
    } catch {
      cartList.value.map((item, index) => (item.checked = prevChecked[index]))
      uni.showToast({ icon: 'none', title: '服务器繁忙，请稍等' })
    }
  }

  // 改变 数字计数器的回调函数
  const onChangeInputNum = async (cart: CartList) => {
    if (isLoading(cart.skuId)) {
      // 在用户连续点击之后 isLoading会上锁
      // 但是模板中的 chooseNum 是双向绑定 所以会导致页面与服务器数据不一致
      // 失败回滚逻辑也失效
      // 所以 被锁住时要放弃UI页面改动
      cart.chooseNum = cart.lastChooseNum
      return
    }
    loadingSkuIds.value.add(cart.skuId)
    try {
      await reqUpdateCart(cart.skuId, { count: cart.chooseNum })
      // 赋值 请求成功后的值 - 方便失败回滚
      cart.lastChooseNum = cart.chooseNum
    } catch {
      cart.chooseNum = cart.lastChooseNum // 失败回滚
      uni.showToast({ title: '操作失败，请重试', icon: 'none' })
    } finally {
      loadingSkuIds.value.delete(cart.skuId)
    }
  }

  // 删除商品 共同逻辑
  const delCart = async (ids: string[]) => {
    try {
      await dialog.confirm({
        iconProps: { name: 'delete', size: '50rpx' },
        title: '确定删除吗?',
        showClose: true,
        beforeConfirm: async () => {
          toast.loading('删除中...')
          try {
            const res = await reqDelCart(ids)
            if (!res) {
              toast.error('删除失败')
              return false // 不关闭对话框，让用户可重试
            }
            toast.success('删除成功')
            await getCartInfo() // 刷新列表
            return true // 关闭对话框
          } catch {
            toast.error('删除失败')
            return false
          }
          // finally {
          //   toast.close() // 无论成功失败都关 loading toast
          // }
        },
      })
    } catch {
      console.log('用户取消')
    }
  }

  // 删除单个商品
  const onDelOneCart = async (skuId: string) => {
    try {
      await delCart([skuId])
    } catch {
      uni.showToast({ icon: 'none', title: '请稍等' })
    }
  }

  // 删除 多个商品
  const DelSelectedGoods = async () => {
    const ids: string[] = collectSelectedSkuIdList.value
    if (!ids.length) {
      toast.warning('请先选择要删除的商品')
      return
    }

    await delCart(ids)
  }

  // 点击去结算的回调函数 前往订单页面
  const ToOrder = () => {
    const invalid = cartList.value.filter((i) => i.checked && (!i.isEffective || !(i.stock > 0)))
    if (invalid.length) {
      toast.warning(`有 ${invalid.length} 件商品已失效，请先移除`)
      return
    }
    if (!collectSelectedSkuIdList.value.length) {
      toast.show('请选择要结算的商品')
      return
    }
    uni.navigateTo({
      url: '/pages_order/order/order',
    })
  }
</script>

<style scoped lang="scss">
  .cart {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f7f8fa;

    .unLogin {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 30rpx;
      width: 100%;
      height: 500rpx;

      :deep() {
        .custom-shadow {
          box-shadow:
            0 3px 1px -2px rgb(0 0 0 / 20%),
            0 2px 2px 0 rgb(0 0 0 / 14%),
            0 1px 5px 0 rgb(0 0 0 / 12%);
        }
      }
    }
  }

  .scroll-area {
    flex: 1;
    min-height: 0; /* 关键！防止被内容撑开 */
  }

  .cartInfo {
    padding: 20rpx;

    .tips-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      background-color: #fff;
      margin-bottom: 20rpx;
      border-radius: 16rpx;
      box-shadow: 0 4rpx 12rpx rgb(0 0 0 / 3%);

      .tips-left {
        display: flex;
        align-items: center;
        gap: 20rpx;

        .tips-text {
          font-size: 28rpx;
          color: #333;
        }
      }

      .delete-text {
        font-size: 28rpx;
        color: #ff4d4f; /* 删除操作通常用红色作为警示 */
        padding: 10rpx 0 10rpx 20rpx; /* 增加左侧间距和点击热区 */
      }
    }

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 30rpx;
      width: 100%;
      height: 500rpx;
      color: #333;
    }
  }

  /* 滑动操作相关 */
  .action {
    height: 100%;
  }

  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 30rpx;
    height: 100%;
    color: #fff;
    font-size: 28rpx;
    white-space: nowrap;
  }

  .is-invalid {
    opacity: 0.55;
  }

  // 商品信息
  .goods-card {
    display: flex;
    align-items: center;
    background-color: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgb(0 0 0 / 3%);

    .goods-left {
      display: flex;
      align-items: stretch;
      gap: 20rpx;
      flex-shrink: 0;

      :deep() {
        .wd-checkbox {
          flex-shrink: 0;
        }
      }

      .img-wrap {
        position: relative;
        flex-shrink: 0;

        .invalid-tag {
          position: absolute;
          top: 0;
          left: 0;
          padding: 4rpx 12rpx;
          font-size: 22rpx;
          color: #fff;
          background: rgb(0 0 0 / 50%);
          border-radius: 12rpx 0;
          white-space: nowrap;
          pointer-events: none;
        }

        .wd-img {
          border-radius: 12rpx;
          flex-shrink: 0;
        }
      }
    }

    .goods-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-left: 20rpx;
      height: 200rpx;

      .goods-name {
        font-size: 28rpx;
        color: #333;
        font-weight: 600;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 80rpx;
      }

      .goods-desc {
        padding: 4rpx 6rpx;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 40rpx;
        font-size: 24rpx;
        color: #999;
      }

      .goods-bottom {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        .goods-price {
          color: #cf4444;
          font-size: 28rpx;
          font-weight: 500;

          .iconPrice {
            font-size: 22rpx;
            margin-right: 2rpx;
          }

          /* 现价/折扣价样式 */
          .current-price {
            font-size: 32rpx;
            font-weight: bold;
            color: #ff4d4f; /* 通常用红色突出价格 */
          }

          /* 原价删除线样式 */
          .original-price {
            font-size: 24rpx;
            color: #999;
            text-decoration: line-through; /* 核心：删除线 */
          }
        }
      }
    }
  }

  // 底部占位空盒子
  .toolbar {
    z-index: 101;
    box-sizing: border-box;
    position: fixed;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    padding: 20rpx 10rpx;
    width: 750rpx;
    background-color: #fff;
    border-bottom: 1px solid #eee;

    .allAndPrice {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 40rpx;
      padding-left: 32rpx;

      .totalPrice {
        color: #999;

        .iconPrice {
          font-size: 28rpx;
          margin-right: 2rpx;
          color: #ff4d4f;
        }

        .current-price {
          font-size: 32rpx;
          font-weight: bold;
          color: #ff4d4f; /* 通常用红色突出价格 */
        }
      }
    }

    .check-out {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-right: 10rpx;
    }
  }
</style>
