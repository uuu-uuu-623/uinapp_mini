<template>
  <view class="viewport">
    <!-- 搜索框 -->
    <wd-search
      v-model="searchVal"
      variant="light"
      placeholder-left
      placeholder="请搜索"
      hide-cancel
      :maxlength="20"
      focus-when-clear
    />
    <!-- 分类 -->
    <view class="cateView">
      <!-- 左侧：一级分类 -->
      <scroll-view class="cateView-left" scroll-y scroll-with-animation enable-back-to-top>
        <wd-skeleton :row-col="leftGrid" animation="gradient" :loading="skeletonLoading">
          <wd-sidebar v-model="active" @change="WhenChangeActive">
            <wd-sidebar-item
              v-for="item in OneCategoryList"
              :key="item.id"
              :value="item.id"
              :label="item.name"
            />
          </wd-sidebar>
        </wd-skeleton>
      </scroll-view>

      <!-- 右侧：轮播图组件+二级分类 -->
      <scroll-view class="cateView-right" scroll-y :scroll-top="rightScrollTop">
        <wd-skeleton :row-col="bannerGrid" animation="gradient" :loading="skeletonLoading">
          <!-- 轮播图组件 -->
          <XtxSwiper class="banner" :which-page="2" />
        </wd-skeleton>

        <wd-skeleton :row-col="goodsGrid" animation="gradient" :loading="skeletonLoading">
          <!-- 二级分类 -->
          <view class="cate-goods" v-for="item in TwoCategoryList" :key="item.id">
            <wd-card type="rectangle">
              <template #title>
                <view class="title">
                  <view class="title-l">
                    <text>{{ item.name }}</text>
                  </view>
                  <view class="title-r">
                    <view>
                      <text>全部</text>
                      <wd-icon
                        name="arrow-right"
                        size="14px"
                        custom-style="vertical-align: center; margin-left: 4px;"
                      ></wd-icon>
                    </view>
                  </view>
                </view>
              </template>
              <template #default>
                <view class="list-group">
                  <!-- 利用 cell单元格 渲染商品 -->
                  <wd-cell-group border>
                    <wd-cell
                      v-for="goods in item.goods"
                      :key="goods.id"
                      clickable
                      value-align="left"
                      title-width="150rpx"
                      @click="goToGoodDetail(goods.id)"
                    >
                      <template #title>
                        <wd-img
                          :src="goods.picture"
                          width="150rpx"
                          height="150rpx"
                          image-mode="aspectFit"
                          lazy-load
                          fade-show
                        ></wd-img>
                      </template>
                      <template #default>
                        <view class="detail">
                          <view class="name">
                            <text>{{ goods.name }}</text>
                          </view>
                          <view class="desc">
                            <text>{{ goods.desc }}</text>
                          </view>
                          <view class="price">
                            <text class="iconPrice">￥</text>
                            <text>{{ goods.price }}</text>
                          </view>
                        </view>
                      </template>
                    </wd-cell>
                  </wd-cell-group>
                </view>
              </template>
            </wd-card>
          </view>
        </wd-skeleton>
      </scroll-view>
    </view>
  </view>
</template>

<script lang="ts" setup>
  import { reqGoodsCategory } from '@/api/goods/goodsCategory'
  import type { Result, Childs } from '@/api/goods/goodsCategory/type'
  import XtxSwiper from '@/components/XtxSwiper/XtxSwiper.vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { ref } from 'vue'
  import { useToast } from '@wot-ui/ui'
  import type { SkeletonRowCol } from '@wot-ui/ui/components/wd-skeleton/types'

  // 使用toast提醒
  const toast = useToast()

  // 组件加载状态
  const loading = ref(false)
  // 所有骨架屏加载状态 - 首次加载 所以为true
  const skeletonLoading = ref(true)

  // 搜索框 绑定变量
  const searchVal = ref('')

  // wd-sidebar 侧边栏 双向绑定的值
  // 默认第一项为激活项
  const active = ref<string>('')

  // - 当切换一级分类激活项时 右侧滚动区域 自动回到最顶上
  const rightScrollTop = ref(0)

  // 用于存储一级分类的数据
  const OneCategoryList = ref<Result[]>([])
  // 用于存储二级分类
  const TwoCategoryList = ref<Childs[]>([])

  // 根据获取到的一级分类的id  找到对应的二级分类
  const findTwoCategory = (cateList: Result[], id: string): Childs[] => {
    const target = cateList.find((item) => item.id === id)
    return target?.children ?? []
  }

  // 请求的到分类数据
  const getGoodsCategory = async () => {
    if (loading.value) return
    loading.value = true
    skeletonLoading.value = true
    try {
      const res = await reqGoodsCategory()
      OneCategoryList.value = res
      if (res.length) {
        // 默认第一项为激活项
        active.value = res[0]?.id ?? ''
      }

      TwoCategoryList.value = findTwoCategory(OneCategoryList.value, active.value as string)
    } catch (error) {
      toast.error('加载失败')
    } finally {
      loading.value = false
      skeletonLoading.value = false // 数据就绪后关闭
    }
  }

  // 从首页的
  onLoad(async () => {
    await getGoodsCategory()
  })

  // 当点击商品的时候 跳转商品详情页
  const goToGoodDetail = (id: string) => {
    uni.navigateTo({
      url: `/pages/goods/goods?id=${id}`,
    })
  }

  // 当改变侧边栏的激活项时 的回调函数
  const WhenChangeActive = ({ value }: { value: string | number; label: string }) => {
    // value是侧边栏双向绑定的值 label是侧边栏的标题
    // 先要得到一级分类的id - value
    // 再通过id 找到二级分类
    // 把这些值 都给到本地变量
    const target = findTwoCategory(OneCategoryList.value, String(value)) //二级分类

    TwoCategoryList.value = target

    // 关键：先设为非0值再设为0，才能触发 scroll-view 重新滚动
    // 如果当前已经是0，直接赋0不会触发滚动
    rightScrollTop.value = rightScrollTop.value === 0 ? 0.01 : 0
  }

  // 左侧一级分类：模拟 sidebar-item（单行文字）
  const leftGrid = [
    [{ width: '60%', height: '40rpx', margin: '0 0 40rpx 30rpx' }],
    [{ width: '60%', height: '40rpx', margin: '0 0 40rpx 30rpx' }],
    [{ width: '60%', height: '40rpx', margin: '0 0 40rpx 30rpx' }],
    [{ width: '60%', height: '40rpx', margin: '0 0 40rpx 30rpx' }],
    [{ width: '60%', height: '40rpx', margin: '0 0 40rpx 30rpx' }],
    [{ width: '60%', height: '40rpx', margin: '0 0 40rpx 30rpx' }],
    [{ width: '60%', height: '40rpx', margin: '0 0 40rpx 30rpx' }],
    [{ width: '60%', height: '40rpx', margin: '0 0 40rpx 30rpx' }],
  ] as SkeletonRowCol[]

  //  轮播图：单行满宽矩形
  const bannerGrid = [
    [{ width: '100%', height: '200rpx', borderRadius: '8rpx' }],
  ] as SkeletonRowCol[]

  //  右侧商品卡片：模拟 wd-card (标题 + 左图右文)
  const goodsGrid = [
    // 卡片标题行
    [{ width: '100%', height: '40rpx', margin: '40rpx 0' }],
    // 内容区
    [{ width: '100%', height: '260rpx', borderRadius: '8rpx' }],
  ] as SkeletonRowCol[]
</script>

<!-- page 根节点样式建议使用非 scoped，确保生效 -->
<style lang="scss">
  page {
    height: 100%;
    overflow: hidden;
  }
</style>
<style scoped lang="scss">
  .viewport {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    .cateView {
      display: flex;
      flex: 1; /* 关键：占据搜索框之外的所有剩余高度 */
      min-height: 0; /* 关键：允许 flex 子项收缩，触发内部滚动 */
      width: 100%;
      background-color: #f7f8fa;

      .cateView-left {
        flex: 0 0 160rpx; /* 固定左侧宽度，比 flex:0.5 更可控 */
        height: 100%;
        min-height: 0;
        background-color: #f7f8fa;
      }

      .cateView-right {
        flex: 1; /* 关键：自动填满剩余宽度 */
        min-height: 0; /* 关键：允许内部 scroll-view 独立滚动 */
        height: 100%;
        padding: 20rpx;
        box-sizing: border-box;
        background-color: #fff;
      }
    }

    // 轮播图组件
    .banner {
      height: 200rpx;
      border-radius: 8rpx;
      overflow: hidden;

      :deep(.wd-swiper),
      :deep(swiper),
      :deep(.swiper-item) {
        height: 200rpx !important;
      }

      // 内部是图片
      :deep(image),
      :deep(.swiper-image) {
        width: 100% !important;
        height: 200rpx !important;
        object-fit: cover; // 防止图片变形
      }
    }

    .cate-goods {
      background: #fff;
      margin-top: 20rpx;

      .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .title-l {
          font-size: 30rpx;
          color: #000;
        }

        .title-r {
          padding: 6rpx 16rpx 0;
          color: #747272;
          font-size: 25rpx;

          &:active {
            color: #ccc;
          }
        }
      }

      :deep(.wd-card__content) {
        padding: 0 20rpx;
      }

      .list-group {
        :deep(.wd-cell) {
          padding: 20rpx 0 12rpx;
        }
      }
    }

    .detail {
      display: flex;
      flex-direction: column;
      justify-content: start;
      margin-left: 14rpx;
      text-align: left;

      .name,
      .desc {
        display: -webkit-box;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .name {
        min-height: 80rpx;
        color: #000;
        font-weight: 600;
      }

      .desc {
        min-height: 40rpx;
        color: #9e9b9b;
        font-size: 20rpx;
        line-height: 40rpx;
        -webkit-line-clamp: 1;
        line-clamp: 1;
      }

      .price {
        line-height: 1;
        padding-top: 4rpx;
        color: #cf4444;
        font-size: 26rpx;
        vertical-align: center;

        .iconPrice {
          font-size: 20rpx;
        }
      }
    }
  }
</style>
