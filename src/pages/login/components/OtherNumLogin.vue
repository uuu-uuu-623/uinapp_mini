<template>
  <!-- ✅ 使用 wd-popup 替代普通 view，position="bottom" 实现底部弹出效果 -->
  <wd-popup
    v-model="show"
    position="bottom"
    safe-area-inset-bottom
    :close-on-click-modal="true"
    custom-style="border-radius: 24rpx 24rpx 0 0; padding: 40rpx; box-sizing: border-box;"
  >
    <!-- 顶部拖拽条/标题（可选） -->
    <view class="popup-header">
      <text class="popup-title">其他手机号登录Demo</text>
      <view class="close-btn" @click="show = false">
        <wd-icon name="close" size="20px" color="#999"></wd-icon>
      </view>
    </view>

    <!-- 手机号输入区域 -->
    <view class="phone-input-section">
      <view class="input-wrapper">
        <view class="area-code">
          <text>+86</text>
          <wd-icon name="arrow-down" size="14px"></wd-icon>
        </view>
        <wd-input
          :disabled="loadingSureBtn || showVerify"
          custom-input-class="phone-input"
          v-model="phoneNumber"
          type="number"
          placeholder="请输入手机号"
          placeholder-style="color: #999999;"
          :maxlength="11"
        />
        <view v-if="phoneNumber" class="clear-btn" @click="clearPhone">
          <wd-icon name="close-circle" size="20px" color="#ccc"></wd-icon>
        </view>
      </view>
    </view>

    <!-- 确认登录按钮 -->
    <view>
      <wd-button
        size="large"
        block
        :loading="loadingSureBtn"
        :disabled="phoneNumber.length !== 11 || loadingSureBtn"
        @click="handleConfirmLogin"
        :style="{
          '--wd-button-primary-bg': '#00A8FF',
          '--wd-button-primary-border': '#00A8FF',
          '--wd-button-disabled-opacity': '0.5',
          borderRadius: '50rpx',
          height: '88rpx',
          fontSize: '32rpx',
        }"
      >
        {{ showVerify ? '验证中...' : '确认并登录' }}
      </wd-button>
    </view>

    <!-- ✅ 核心修改：滑块验证直接放在表单内，通过 v-if 控制显隐 -->
    <view v-if="showVerify" class="verify-section">
      <view class="verify-tip">请完成安全验证</view>
      <wd-slide-verify
        ref="slideVerifyRef"
        background-color="#E8F4FF"
        active-background-color="#4D94FF"
        :tolerance="20"
        @success="veritySuccess"
        @fail="handleFail"
      />
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
  import { useUserStore } from '@/stores/modules/user'
  import { ref, nextTick } from 'vue'
  import type { SlideVerifyInstance } from '@wot-ui/ui/components/wd-slide-verify/types'

  const userStore = useUserStore()

  // ✅ 使用 defineModel 自动处理 v-model:show 的双向绑定
  // 无需再手动 defineProps + defineEmits + emit('update:show')
  const show = defineModel<boolean>('show', { default: false })

  const emits = defineEmits(['successLogin'])

  // 确认按钮的加载状态
  const loadingSureBtn = ref(false)
  // 是否 点击了确定并登录按钮
  const isSubmitting = ref(false)
  // 展示验证滑块
  const showVerify = ref(false)
  // 滑块验证的ref
  const slideVerifyRef = ref<SlideVerifyInstance>()

  const phoneNumber = ref<string>('')

  const clearPhone = () => {
    phoneNumber.value = ''
  }

  // 把手机号给到 用户仓库  在仓库中发送请求
  const handleConfirmLogin = async () => {
    if (loadingSureBtn.value) return
    if (!/^1[3-9]\d{9}$/.test(phoneNumber.value)) {
      uni.showToast({ title: '请输入正确的手机号码', icon: 'none' })
      return
    }
    loadingSureBtn.value = true
    showVerify.value = true

    // TODO: 调用获取验证码接口  - 用滑块验证代替

    // ✅ 关键：等待 DOM 更新完成后，确保滑块组件已挂载且尺寸计算正确
    await nextTick()
  }

  // 滑块验证成功之后的回调
  const veritySuccess = async () => {
    if (isSubmitting.value) return // 用独立标志位防重复提交
    isSubmitting.value = true
    try {
      await userStore.loginDev(phoneNumber.value)
      // 关闭验证弹窗
      showVerify.value = false
      slideVerifyRef.value?.reset()
      // 关闭其他手机号登录弹窗
      show.value = false
      // 登陆成功之后 返回用户信息页
      emits('successLogin')
    } catch (error) {
      console.error('其他手机号登录失败:', error)
      uni.showToast({ title: '登录失败，请重试', icon: 'none' }) // ✅ 补充错误提示
      slideVerifyRef.value?.reset() // ✅ 失败时重置滑块，允许用户重试
    } finally {
      loadingSureBtn.value = false
      isSubmitting.value = false
    }
  }

  // 滑块验证失败之后的回调
  const handleFail = () => {
    uni.showToast({ title: '验证失败，请重试', icon: 'none' })
    slideVerifyRef.value?.reset() // ✅ 重置滑块让用户可以重新拖拽
  }
</script>

<style lang="scss" scoped>
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;

    .popup-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }

    .close-btn {
      padding: 10rpx;
    }
  }

  .phone-input-section {
    margin-bottom: 60rpx;

    .input-wrapper {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #eaeaea;
      padding-bottom: 20rpx;

      .area-code {
        display: flex;
        align-items: center;
        font-size: 32rpx;
        color: #333;
        white-space: nowrap;
        margin-right: 20rpx;

        ::v-deep .wd-icon {
          margin-left: 6rpx;
        }
      }

      .phone-input {
        flex: 1;
        height: 60rpx;
        font-size: 32rpx;
        color: #333;
      }

      .clear-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40rpx;
        height: 40rpx;
        margin-left: 10rpx;
      }
    }
  }

  /* ✅ 新增：验证区域样式 */
  .verify-section {
    margin-bottom: 40rpx;

    .verify-tip {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 20rpx;
    }
  }
</style>
