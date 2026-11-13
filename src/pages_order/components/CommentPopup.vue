<template>
  <!-- 评价弹出层 -->
  <wd-popup
    v-model="visible"
    position="bottom"
    safe-area-inset-bottom
    :close-on-click-modal="false"
    custom-style="height: 90vh;"
    round
    clearable
  >
    <view class="comment-popup">
      <!-- 顶部标题栏 -->
      <view class="popup-header">
        <text class="popup-title">商品评价</text>
        <view class="popup-close" @click="visible = false">
          <wd-icon name="close" size="40rpx" color="#999" />
        </view>
      </view>

      <!-- 可滚动内容区 -->
      <scroll-view scroll-y class="popup-body">
        <wd-form ref="formRef" :model="commentForm" :schema="formSchema">
          <!-- 评分区 -->
          <view class="section rate-section">
            <wd-form-item v-for="rate in visibleRates" :key="rate.key" :prop="rate.key">
              <view class="rate-item">
                <text class="rate-label">{{ rate.label }}</text>
                <wd-rate v-model="commentForm[rate.key]" :num="5" />
                <text class="rate-desc">{{ RATE_TEXT[commentForm[rate.key] - 1] }}</text>
              </view>
            </wd-form-item>

            <!-- 超过一项才显示展开/收起 -->
            <view
              class="rate-toggle"
              v-if="rateList.length > 1"
              @click="showAllRates = !showAllRates"
            >
              <text>{{ showAllRates ? '收起' : '展开更多评分' }}</text>
              <wd-icon :name="showAllRates ? 'arrow-up' : 'arrow-down'" size="24rpx" color="#999" />
            </view>
          </view>

          <!-- 评价内容 -->
          <view class="section content-section">
            <wd-form-item prop="content">
              <view class="content-label">评价内容</view>
              <wd-textarea
                v-model="commentForm.content"
                placeholder="商品满足你的期待吗？说说它的优点和不足吧~"
                :maxlength="500"
                show-word-limit
              />
            </wd-form-item>
          </view>

          <!-- 匿名评价 -->
          <view class="section anonymous-section">
            <view class="anonymous-left">
              <text class="anonymous-label">匿名评价</text>
              <text class="anonymous-tip">匿名后不展示你的头像和昵称</text>
            </view>
            <wd-switch v-model="commentForm.isAnonymous" size="40rpx" />
          </view>
        </wd-form>
      </scroll-view>

      <!-- 底部提交 -->
      <view class="popup-footer">
        <wd-button type="primary" block round :loading="submitting" @click="onSubmitComment">
          提交评价
        </wd-button>
      </view>
    </view>
  </wd-popup>

  <wd-toast cover />
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, watch, nextTick } from 'vue'
  import { useToast } from '@wot-ui/ui/composables'
  import type { FormSchema } from '@wot-ui/ui'
  import type { FormInstance } from '@wot-ui/ui/components/wd-form/types'

  const toast = useToast()

  const props = defineProps<{ showCommentPopup: boolean }>()
  const emit = defineEmits<{
    (e: 'update:showCommentPopup', value: boolean): void
  }>()

  const visible = computed({
    get: () => props.showCommentPopup,
    set: (v) => emit('update:showCommentPopup', v),
  })

  // 表单的ref
  const formRef = ref<FormInstance>()

  // 打开时重置，而不是在 before-enter 里重置
  watch(
    () => props.showCommentPopup,
    async (v) => {
      if (v) {
        await nextTick()
        resetForm()
      }
    },
  )

  // ============ 评分项定义（只存 key 和 label，值在 commentForm 里） ============
  const rateList = [
    { key: 'product', label: '商品评分' },
    { key: 'match', label: '描述相符' },
    { key: 'logistics', label: '物流服务' },
  ] as const

  type RateKey = (typeof rateList)[number]['key']

  const RATE_TEXT = ['非常差', '差', '一般', '满意', '非常满意']

  // ============ 表单数据（扁平结构，key 与 prop 一一对应） ============
  const commentForm = reactive<{
    product: number
    match: number
    logistics: number
    content: string
    isAnonymous: boolean
  }>({
    product: 0,
    match: 0,
    logistics: 0,
    content: '',
    isAnonymous: true,
  })

  // ============ 展开状态 ============
  const showAllRates = ref(false)

  const visibleRates = computed(() => (showAllRates.value ? rateList : rateList.slice(0, 1)))

  // ============ 校验 Schema ============
  const formSchema: FormSchema = {
    validate(model) {
      const issues: { path: string[]; message: string }[] = []

      // 评分项：必须 ≥ 1
      const rateLabels: Record<RateKey, string> = {
        product: '商品评分',
        match: '描述相符',
        logistics: '物流服务',
      }
      for (const [key, label] of Object.entries(rateLabels)) {
        if (!model[key] || model[key] < 1) {
          issues.push({ path: [key], message: `请完成「${label}」` })
        }
      }

      // 内容：去空格后非空且 ≥ 5 字
      const content = (model.content ?? '').trim()
      if (!content) {
        issues.push({ path: ['content'], message: '请填写评价内容' })
      } else if (content.length < 5) {
        issues.push({ path: ['content'], message: '评价内容至少 5 个字' })
      }

      return issues
    },
  }

  // ============ 提交 ============
  const submitting = ref(false)

  const onSubmitComment = async () => {
    if (!formRef.value) return
    if (submitting.value) return

    try {
      const { valid } = await formRef.value.validate()
      if (!valid) return // 行内错误会自动展示

      submitting.value = true
      // TODO: 替换为真实接口
      // await reqSubmitComment({
      //   productRate: commentForm.product,
      //   matchRate: commentForm.match,
      //   logisticsRate: commentForm.logistics,
      //   content: commentForm.content.trim(),
      //   anonymous: commentForm.isAnonymous,
      // })
      toast.success('评价提交成功')
      visible.value = false
      resetForm()
    } catch {
      toast.error('提交失败，请重试')
    } finally {
      submitting.value = false
    }
  }

  // ============ 重置 ============
  const resetForm = () => {
    commentForm.product = 0
    commentForm.match = 0
    commentForm.logistics = 0
    commentForm.content = ''
    commentForm.isAnonymous = true
    showAllRates.value = false
    // 清除行内错误提示
    formRef.value?.reset()
  }
</script>

<style scoped lang="scss">
  /* 评价弹出层相关样式 */
  /* 评价弹出层 */
  .comment-popup {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #f5f5f5;
  }

  /* 顶部标题栏 */
  .popup-header {
    position: relative;
    flex-shrink: 0;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    border-bottom: 1rpx solid #f0f0f0;

    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .popup-close {
      position: absolute;
      right: 24rpx;
      top: 50%;
      transform: translateY(-50%);
      padding: 8rpx;
    }
  }

  /* 滚动内容区 */
  .popup-body {
    flex: 1;
    min-height: 0;
    padding: 20rpx;
    box-sizing: border-box;
  }

  /* 卡片通用 */
  .section {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* 统一去掉 wd-form-item 默认的 padding / margin，让卡片自己控制留白 */
  :deep(.wd-form-item) {
    padding: 0;
    margin-bottom: 0;
  }

  :deep(.wd-form-item__body) {
    width: 100%;
  }

  /* 评分区 */
  .rate-section {
    :deep(.wd-form-item) {
      & + .wd-form-item {
        margin-top: 24rpx;
      }
    }

    .rate-item {
      display: flex;
      align-items: center;

      .rate-label {
        width: 140rpx;
        flex-shrink: 0;
        font-size: 28rpx;
        color: #333;
      }

      .rate-desc {
        margin-left: 20rpx;
        font-size: 26rpx;
        color: #ff9800;
      }
    }

    .rate-toggle {
      margin-top: 24rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6rpx;
      font-size: 24rpx;
      color: #999;
      padding-top: 16rpx;
      border-top: 1rpx solid #f5f5f5;
    }
  }

  /* 评价内容 */
  .content-section {
    .content-label {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 16rpx;
    }

    :deep(.wd-textarea) {
      padding: 0;
    }

    :deep(.wd-textarea__inner) {
      padding: 0;
      background-color: transparent;
    }
  }

  /* 匿名评价 */
  .anonymous-section {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .anonymous-left {
      display: flex;
      flex-direction: column;

      .anonymous-label {
        font-size: 28rpx;
        color: #333;
      }

      .anonymous-tip {
        margin-top: 6rpx;
        font-size: 22rpx;
        color: #999;
      }
    }
  }

  /* 底部提交 */
  .popup-footer {
    flex-shrink: 0;
    padding: 20rpx 30rpx;
    background-color: #fff;
    border-top: 1rpx solid #f0f0f0;
  }
</style>
