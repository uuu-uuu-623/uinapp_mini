<template>
  <!-- 商品详情页 -->
  <view class="goods" :style="`{padding-bottom:${safeArea} ;}`">
    <!-- 骨架屏 -->
    <!-- 轮播图区块 -->
    <wd-skeleton
      :loading="isSkeLoading"
      :rows="1"
      :row-col="[{ height: '700rpx' }]"
      :custom-style="{ marginBottom: '20rpx' }"
    >
      <!-- 轮播图 -->
      <view class="swiper">
        <wd-swiper
          :list="swiperList"
          autoplay
          stop-autoplay-when-video-play
          :autoplay-video="false"
          easing-function="linear"
          v-model:current="current"
          :indicator="{ type: 'fraction' }"
          indicator-position="bottom-right"
          height="700rpx"
          image-mode="aspectFill"
          @click="handlePerView"
        ></wd-swiper>
      </view>
    </wd-skeleton>

    <!-- 骨架屏 -->
    <!-- 商品信息卡片区块 -->
    <wd-skeleton :loading="isSkeLoading" :row-col="[{ height: '300rpx' }]" theme="paragraph">
      <!-- 商品信息卡片 -价格、描述、品牌信息等 -->
      <wd-card>
        <template #title>
          <!-- 标题主要是展示价格 和折扣价  -->
          <view class="priceInfo">
            <view class="oldprice">
              <text style="font-size: 34rpx; color: #ff5e3e; margin-right: 6rpx">¥</text>
              <text>{{ goodsInfoData?.oldPrice }}</text>
            </view>
            <view class="discountPrice" v-if="Number(goodsInfoData?.discount) < 1">
              <view class="dis">折扣价</view>
              <text class="disPrice">¥{{ goodsInfoData?.price }}</text>
            </view>
          </view>
        </template>
        <template #default>
          <!-- 展示商品名称、描述、品牌信息 -->
          <view class="infoDesc">
            <view class="infoName">{{ goodsInfoData?.name }}</view>
            <view class="infoBrand">
              <wd-tag variant="light" type="warning">{{ goodsInfoData?.brand.name }}</wd-tag>
              <wd-tag variant="light" v-for="item in goodsInfoData?.categories" :key="item.id">
                {{ item.name }}
              </wd-tag>
            </view>
            <view class="desc">{{ goodsInfoData?.desc }}</view>
          </view>
        </template>
        <template #footer>
          <!-- 展示 服务 然后有弹出层 -->
          <wd-cell-group>
            <wd-cell is-link @click="showServerPopup">
              <template #title>
                <view>服务</view>
              </template>
              <template #default>
                <text>无忧退 快速退款 免费包邮</text>
              </template>
            </wd-cell>
          </wd-cell-group>
        </template>
      </wd-card>
    </wd-skeleton>

    <!-- 骨架屏 -->
    <!-- 商品详情卡片区块 -->
    <wd-skeleton
      :loading="isSkeLoading"
      :rows="2"
      :row-col="[{ height: '400rpx' }]"
      theme="paragraph"
    >
      <!-- 商品详情卡片 -->
      <wd-card title="商品详情">
        <template #default>
          <view v-show="goodsDetail.length > 0">
            <view class="good-detail" v-show="goodsDetail.length > 0">
              <view class="detail-data" v-for="item in goodsDetailOnlyThree" :key="item.name">
                <text class="prop-name">{{ item.name }}</text>
                <text class="prop-value">{{ item.value }}</text>
              </view>
            </view>
            <view class="all" v-show="goodsDetail.length > 0" @click="handleGoodsDeatilPopup">
              <text>查看全部</text>
              <wd-icon name="right" size="24rpx"></wd-icon>
            </view>
          </view>
          <!-- 详情卡片 图片 -->
          <view class="detail-imgs-wrapper" v-show="goodsDetailImgs.length > 0">
            <wd-img
              v-for="(item, index) in goodsDetailImgs"
              :key="index"
              :src="item"
              lazy-load
              enable-preview
              mode="widthFix"
              width="100%"
              custom-class="detail-img-item"
            >
              <template #loading>
                <wd-loading />
              </template>
            </wd-img>
          </view>
        </template>
      </wd-card>
    </wd-skeleton>

    <!-- 同类推荐卡片 -->
    <wd-card>
      <template #title>
        <text style="font-size: 40rpx; font-weight: 600">同类推荐</text>
      </template>
      <template #default>
        <view class="goods">
          <wd-grid :column="2" clickable border>
            <wd-grid-item
              v-for="goods in similarGoods"
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
      </template>
    </wd-card>

    <!-- 底部 -->
    <wd-tabbar fixed bordered safe-area-inset-bottom placeholder custom-style="padding-top:20rpx">
      <!-- 将“收藏”替换为自定义的点击项，并手动控制其激活样式 -->
      <wd-tabbar-item name="collect">
        <template #icon>
          <!-- 用 view 或 wd-button 包裹，并绑定独立的 click 事件 -->
          <view
            @click.stop="toggleCollect"
            style="display: flex; flex-direction: column; align-items: center"
          >
            <!-- 图标可以根据 isCollected 切换颜色或类型 -->
            <wd-icon
              :name="isCollected ? 'heart-fill' : 'heart'"
              :color="isCollected ? '#ee0a24' : '#000'"
              size="24px"
            />
            <text
              :style="{
                fontSize: '20rpx',
                lineHeight: '16px',
                color: isCollected ? '#ee0a24' : '#000',
              }"
            >
              {{ isCollected ? '已收藏' : '收藏' }}
            </text>
          </view>
        </template>
      </wd-tabbar-item>
      <wd-tabbar-item name="service" title="客服" icon="headset"></wd-tabbar-item>
      <wd-tabbar-item name="cart" title="购物车" icon="store"></wd-tabbar-item>
      <wd-tabbar-item name="addToCart">
        <wd-button
          type="warning"
          round
          custom-style="font-size:28rpx"
          @click.stop="openSkuPopup_cart"
        >
          加入购物车
        </wd-button>
      </wd-tabbar-item>
      <wd-tabbar-item name="buy">
        <wd-button round custom-style="margin:0 20rpx;font-size:28rpx">立即购买</wd-button>
      </wd-tabbar-item>
    </wd-tabbar>
  </view>

  <!-- 图片预览占位组件 -->
  <wd-image-preview />
  <!-- 返回顶部 -->
  <wd-backtop :scroll-top="scrollTop"></wd-backtop>

  <!-- 商品信息卡片中的服务弹出层 -->
  <GoodsDetailPopup v-model:show="isShowServerPopup">
    <template #default>
      <view class="service-panel">
        <!-- 标题 -->
        <view class="title">服务说明</view>
        <!-- 内容 -->
        <view class="content">
          <view class="item">
            <view class="dt">无忧退货</view>
            <view class="dd">
              自收到商品之日起30天内，可在线申请无忧退货服务（食品等特殊商品除外）
            </view>
          </view>
          <view class="item">
            <view class="dt">快速退款</view>
            <view class="dd">
              收到退货包裹并确认无误后，将在48小时内办理退款，
              退款将原路返回，不同银行处理时间不同，预计1-5个工作日到账
            </view>
          </view>
          <view class="item">
            <view class="dt">满88元免邮费</view>
            <view class="dd">
              单笔订单金额(不含运费)满88元可免邮费，不满88元， 单笔订单收取10元邮费
            </view>
          </view>
        </view>
      </view>
    </template>
  </GoodsDetailPopup>

  <!-- 商品详情的 全部内容的弹出层组件 -->
  <GoodsDetailPopup v-model:show="GoodsDeatilPopupShow">
    <template #default>
      <view style="width: 100%; text-align: center; padding-top: 20rpx">
        <text style="font-size: 36rpx; font-size: 600">商品详情</text>
      </view>
      <view class="popup-detail" v-for="item in goodsDetail" :key="item.name">
        <text class="popup-name">{{ item.name }} :</text>
        <text class="popup-value">{{ item.value }}</text>
      </view>
    </template>
  </GoodsDetailPopup>

  <!-- sku规格弹出层 -->
  <VkDataGoodsSkuPopup
    v-model="isShowSkuPopup"
    :localdata="localdata"
    theme="black-white"
    safe-area-inset-bottom
  ></VkDataGoodsSkuPopup>
</template>

<script lang="ts" setup>
  import { reqGoodsDetail } from '@/api/goods/goodsDetails'
  import { onLoad, onPageScroll } from '@dcloudio/uni-app'
  import { ref, computed } from 'vue'
  import type { GoodsAttrList, goodsInfo, similarProductsList } from '@/api/goods/goodsDetails/type'
  import type { SkuPopupLocaldata } from '@/components/vk-data-goods-sku-popup/type.ts'
  // 显式引入，确保小程序端被注册进 usingComponents（否则页面引用了未注册组件会白屏）
  import VkDataGoodsSkuPopup from '@/components/vk-data-goods-sku-popup/vk-data-goods-sku-popup.vue'

  // 引入wot-ui的图片预览 组合式函数
  import { useImagePreview } from '@wot-ui/ui'
  import GoodsDetailPopup from './components/GoodsDetailPopup.vue'
  // 向previewImage 传入图片数组即可
  const { previewImage } = useImagePreview()

  // 页面的安全区域
  const safeArea = ref<{
    bottom: number
    left: number
    right: number
    top: number
  }>()

  // 骨架屏状态
  const isSkeLoading = ref(true)
  // 页面数据加载状态
  const loading = ref(false)

  // 返回顶部
  const scrollTop = ref(0)
  onPageScroll((event) => {
    scrollTop.value = event.scrollTop
  })

  // 轮播图当前页
  const current = ref(0)
  const swiperList = ref<string[]>([])
  // 如果有视频 则unshift 加入swiperList
  const swiperVideoList = ref<string[]>([])

  // 接收商品id
  const goodId = ref('')

  // 存储商品全部信息数据
  const goodsInfoData = ref<goodsInfo>()

  // 是否展示商品信息卡片中的服务弹出层
  const isShowServerPopup = ref(false)
  const showServerPopup = () => {
    isShowServerPopup.value = true
  }

  // 存储商品详情的商品属性数据
  const goodsDetail = ref<GoodsAttrList[]>([])
  // 存储商品详情的图片数据
  const goodsDetailImgs = ref<string[]>([])
  // 通过计算属性 只获取商品详情数据的 前三个数据 其他数据在弹出层组件中展示
  const goodsDetailOnlyThree = computed(() => {
    if (goodsDetail.value.length === 0) return []
    if (goodsDetail.value.length >= 3) {
      return goodsDetail.value.slice(0, 3)
    } else {
      return goodsDetail.value
    }
  })
  // 存储同类推荐商品数据
  const similarGoods = ref<similarProductsList[]>([])

  // tabbar下的收藏状态
  const isCollected = ref(false) // 独立的收藏状态

  // 弹出层组件的ref
  // const skuRef = ref<SkuPopupInstanceType>()
  // 控制sku弹出层组件的展示
  const isShowSkuPopup = ref(false)
  // sku数据源
  const localdata = ref<SkuPopupLocaldata>({} as SkuPopupLocaldata)

  // 请求得到商品详情数据
  const getGoodsDetail = async () => {
    if (loading.value) return
    loading.value = true
    isSkeLoading.value = true
    try {
      const res: goodsInfo = await reqGoodsDetail(goodId.value)
      goodsInfoData.value = res
      // 获取 轮播图图片数据
      swiperList.value = res.mainPictures || []
      // 如果有视频 就推进去swiperList
      if (res.mainVideos) {
        swiperVideoList.value = res.mainVideos
        swiperList.value.unshift(...swiperVideoList.value)
      }
      // 获取商品详情的商品属性数据
      goodsDetail.value = res.details.properties
      // 商品详情的商品属性数据
      goodsDetailImgs.value = res.details.pictures
      similarGoods.value = res.similarProducts

      // 获得sku 数据信息
      localdata.value = {
        _id: res.id,
        name: res.name,
        goods_thumb: res.mainPictures[0] as string,
        spec_list: (res.specs || []).map((item) => ({
          name: item.name,
          // 兼容接口返回的 value 可能是 字符串数组 或 {name} 对象数组，并兜底空数组
          // 否则 spec_list[0].list 为 undefined，插件组件 isManyCom 会崩溃
          list: (item.value || []).map((v) => (typeof v === 'string' ? { name: v } : v)),
        })),
        sku_list: res.skus.map((item) => {
          return {
            _id: item.id,
            goods_id: res.id,
            goods_name: res.name,
            image: item.picture as string,
            price: Number(item.price) * 100,
            //sku规格组成  规格值数组
            sku_name_arr: item.specs.map((i) => i.valueName),
            stock: item.inventory,
          }
        }),
      }
      console.log(res)
    } catch (error) {
      console.warn(error)
    } finally {
      loading.value = false
      isSkeLoading.value = false
    }
  }

  onLoad(async (option) => {
    // 接收传过来的query参数
    goodId.value = option?.id ?? ''
    const sysInfo = uni.getSystemInfoSync()
    safeArea.value = sysInfo.safeArea

    await getGoodsDetail()
  })

  // 点击轮播图图片 然后预览图片的回调函数
  const handlePerView = ({ index }: { index: number }) => {
    let $index = index
    previewImage({
      images: [...swiperList.value],
      startPosition: index,
      onChange: (index) => {
        // 记录当前是那个索引
        $index = index
      },
      onClose: () => {
        current.value = $index
      },
    })
  }

  // 控制商品详情的弹出层组件 是否展示
  const GoodsDeatilPopupShow = ref(false)
  // 当点击商品详情中 查看全部的区域
  const handleGoodsDeatilPopup = () => {
    GoodsDeatilPopupShow.value = true
  }

  // 独立的收藏切换函数
  const toggleCollect = () => {
    isCollected.value = !isCollected.value
  }

  // 未来点击加入购物车按钮的回调
  // 展示sku 选择规格 数量加减 确认按钮 请求加入购物车 成功加入购物车
  const openSkuPopup_cart = () => {
    console.log('加入购物车222')
    console.log(localdata.value)
    console.log(isShowSkuPopup.value)

    isShowSkuPopup.value = true
    console.log(isShowSkuPopup.value)

    console.log('加入购物车')
  }
</script>

<style scoped lang="scss">
  :deep(.wd-skeleton) {
    margin-bottom: 40rpx;
  }

  .goods {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background-color: #f7f8fa;

    .swiper {
      margin-bottom: 20rpx;
    }

    :deep(.wd-card__title) {
      padding-bottom: 0;
    }

    :deep(.wd-card__footer) {
      display: block;
      padding: 0;
    }

    :deep(.wd-cell__right) {
      flex: none !important;
    }

    .priceInfo {
      display: flex;
      align-items: flex-end;
      margin-top: 24rpx;

      .oldprice {
        color: #ff5e3e;
        font-size: 48rpx;
        font-weight: bold;
        line-height: 1;
        vertical-align: bottom;
      }

      .discountPrice {
        display: flex;
        align-items: center;
        margin-left: 16rpx;

        .dis {
          background-color: #d48124;
          color: #fff;
          font-size: 20rpx;
          padding: 4rpx 10rpx;
          border-radius: 8rpx;
          transform: scale(0.9);
        }

        .disPrice {
          color: #d48124;
          font-size: 24rpx;
          font-weight: bold;
          margin-left: 6rpx;
        }
      }
    }

    .infoDesc {
      display: flex;
      flex-direction: column;
      justify-content: start;
      gap: 14rpx;

      .infoName {
        display: block;
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
        margin-top: 12rpx;
        line-height: 1.4;
      }

      .infoBrand {
        display: flex;
        gap: 10rpx;
      }

      .desc {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        overflow: hidden;
        font-size: 24rpx;
        color: #999;
        line-height: 1.5;
      }
    }

    .good-detail {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f7f8fa;
      padding: 20rpx 0;
      font-size: 28rpx;
      border-radius: 8rpx;

      .detail-data {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        gap: 16rpx;
        padding: 0 16rpx;
        width: 200rpx;
        text-align: center;

        .prop-name {
          color: #999;
          width: 150rpx;
          flex-shrink: 0;

          /* 防止属性名本身过长导致布局异常 */
          display: -webkit-box;
          text-overflow: ellipsis;
          -webkit-line-clamp: 1;
          line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .prop-value {
          color: #333;
          flex: 1;
          min-width: 0; /* ⚠️ 关键：flex子项默认min-width:auto，不加此行ellipsis在部分浏览器/小程序中不生效 */
          display: -webkit-box;
          text-overflow: ellipsis;
          -webkit-line-clamp: 1;
          line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }

    .all {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 10rpx;
      text-align: center;

      &:active {
        color: #999;
      }
    }

    // 图片容器：抵消 wd-card 内部 padding 的影响，确保图片撑满
    .detail-imgs-wrapper {
      margin: 20rpx -32rpx 0; // ⚠️ 负margin值需根据你实际 wd-card 的padding调整
    }

    // 单张图片样式
    :deep(.detail-img-item) {
      display: block !important; // 消除行内元素底部空白间隙
      width: 100% !important;

      // 确保内部 image 标签也正确自适应
      img,
      image {
        display: block;
        width: 100%;
        height: auto;
      }
    }

    .goods {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 10rpx;

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
  }

  // 商品详情的 全部内容的弹出层组件
  .popup-detail {
    display: flex;
    align-items: baseline; // ✅ 改为 baseline，多行换行时首行文字基线对齐
    padding: 24rpx 32rpx;
    gap: 24rpx;

    .popup-name {
      color: #999;
      font-size: 28rpx;
      flex-shrink: 0; // 防止标签被压缩
      min-width: 140rpx; // ✅ 固定最小宽度，让所有行的数值左对齐
      line-height: 1.5;
    }

    .popup-value {
      color: #333;
      font-size: 28rpx;
      flex: 1; // ✅ 占据剩余空间，避免右侧空白过大
      overflow-wrap: break-word;
      line-height: 1.5;
      text-align: left; // ✅ 改为左对齐，配合 min-width 实现整齐排列
    }
  }

  .service-panel {
    padding: 0 30rpx;
    border-radius: 10rpx 10rpx 0 0;
    position: relative;
    background-color: #fff;
  }

  .title {
    line-height: 1;
    padding: 40rpx 0;
    text-align: center;
    font-size: 32rpx;
    font-weight: normal;
    border-bottom: 1rpx solid #ddd;
    color: #444;
  }

  .content {
    padding: 20rpx 20rpx 100rpx;

    .item {
      margin-top: 20rpx;
    }

    .dt {
      margin-bottom: 10rpx;
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      position: relative;

      &::before {
        content: '';
        width: 10rpx;
        height: 10rpx;
        border-radius: 50%;
        background-color: #eaeaea;
        transform: translateY(-50%);
        position: absolute;
        top: 50%;
        left: -20rpx;
      }
    }

    .dd {
      line-height: 1.6;
      font-size: 26rpx;
      color: #999;
    }
  }
</style>
