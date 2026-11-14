<template>
  <view class="login-container">
    <!-- 顶部 Logo 和标题区域 -->
    <view class="header-section">
      <view class="logo-wrapper">
        <!-- 请替换为你自己的 Logo 图片路径 -->
        <image class="logo-img" src="/static/logo.png" mode="aspectFit"></image>
      </view>
      <text class="app-title">小马鲜生</text>
    </view>

    <!-- 操作按钮区域 -->
    <view class="action-section">
      <!-- 一键登录按钮（主按钮） -->
      <wd-button
        type="primary"
        size="large"
        block
        :style="{
          '--wd-button-primary-bg': '#00A8FF',
          '--wd-button-primary-border': '#00A8FF',
          borderRadius: '50rpx',
          margin: '24rpx 0',
          height: '88rpx',
          fontSize: '32rpx',
        }"
        open-type="getPhoneNumber"
        @getphonenumber="getPhoneNumberDev"
      >
        手机号一键登录
      </wd-button>

      <!-- 其他手机号登录按钮（次按钮） -->
      <wd-button
        plain
        variant="plain"
        size="large"
        block
        :style="{
          '--wd-button-primary-color': '#00A8FF',
          borderRadius: '50rpx',
          height: '88rpx',
          fontSize: '32rpx',
          marginBottom: '32rpx',
        }"
        @click="handleOtherPhoneLogin"
      >
        其他手机号登录
      </wd-button>
    </view>

    <!-- 协议与勾选区域 -->
    <view class="agreement-section">
      <wd-checkbox v-model="agreementChecked" :style="{ transform: 'scale(0.9)' }">
        <view class="agreement-text">
          <text>若您手机号未注册，登录时将自动注册，且代表您同意</text>
          <text class="link">《小兔鲜生会员服务协议》</text>
          <text>和</text>
          <text class="link">《小兔鲜生隐私权政策》</text>
          <text>。</text>
        </view>
      </wd-checkbox>
    </view>
  </view>

  <!-- 弹窗 授权手机号 -->
  <wd-dialog />
  <!-- 其他手机号登陆 -->
  <OtherNumLogin v-model:show="isUseOtherNumber" @success-login="successLogin"></OtherNumLogin>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { onLoad, onUnload } from '@dcloudio/uni-app'
  import OtherNumLogin from './components/OtherNumLogin.vue'
  // 引入用户仓库
  import { useUserStore } from '@/stores/modules/user'
  import { useDialog } from '@wot-ui/ui'

  // 是否同意用户协议
  const agreementChecked = ref<boolean>(false)

  // 是否使用其他号码登录
  const isUseOtherNumber = ref(false)
  // 一键登录按钮的加载状态
  const loginLoading = ref(false)

  const fromUrl = ref('')
  const goodId = ref('')

  // 获取code登陆凭证
  let code: string = ''
  onLoad(async (options) => {
    const res = await uni.login()
    code = res.code
    if (options?.fromUrl && options?.goodId) {
      fromUrl.value = options?.fromUrl
      goodId.value = options?.goodId
    }
  })

  const userStore = useUserStore()
  const dialog = useDialog()

  // 定时器id
  let timer: ReturnType<typeof setTimeout> | null = null

  // 登陆成功后 的处理函数
  const successLogin = () => {
    if (!userStore.isLogin) return
    if (timer !== null) {
      clearTimeout(timer)
    }
    uni.showToast({ icon: 'success', title: '登陆成功' })

    let toUrl = ''
    if (fromUrl.value) {
      toUrl = goodId.value
        ? `/pages/${fromUrl.value}/${fromUrl.value}?id=${goodId.value}`
        : `/pages/${fromUrl.value}/${fromUrl.value}`
    }
    timer = setTimeout(() => {
      // 登陆成功之后
      // 如果是从商品详情页或者是别的页面跳转过来的 则回到对应页面
      // 否则 回去首页
      uni.navigateBack({
        delta: 1,
        fail: () => {
          // 兜底：仅当页面栈中无上一页时触发（如直接扫码进入登录页）
          const tabBarPages = ['pages/index/index', 'pages/cart/cart', 'pages/my/my']
          const isTabBar = tabBarPages.some((p) => toUrl.includes(p))

          if (isTabBar) {
            uni.switchTab({ url: toUrl })
          } else {
            uni.redirectTo({ url: toUrl })
          }
        },
      })

      timer = null // ✅ 执行完毕后置空
    }, 900)
  }

  // 企业版 获取用户手机号码 一键登录
  // const getPhoneNumber = async (ev: any) => {
  //   if (!agreementChecked.value) {
  //     uni.showToast({ title: '请先同意服务协议', icon: 'none' })
  //     return
  //   }

  //   const encryptedData = ev.detail!.encryptedData!
  //   const iv = ev.detail!.iv!
  //   await userStore.login({ code, encryptedData, iv })
  //   successLogin()
  // }

  /**
   * 手机号一键登录处理
   */
  // 获取手机号回调  模拟登录
  const getPhoneNumberDev = () => {
    if (!agreementChecked.value) {
      uni.showToast({ title: '请先同意服务协议', icon: 'none' })
      return
    }
    if (loginLoading.value) return
    loginLoading.value = true
    dialog.confirm({
      title: '确定授权手机号一键登录',
      confirmButtonProps: {
        text: '确定',
        openType: 'getPhoneNumber',
        onGetphonenumber: async () => {
          try {
            await userStore.loginDev('13694391689')
            successLogin()
          } catch (error) {
            console.error('一键登录失败:', error)
            uni.showToast({ title: '登录失败，请重试', icon: 'none' })
          } finally {
            loginLoading.value = false
          }
        },
      },
    })
  }

  /**
   * 其他手机号登录处理（如跳转到输入验证码登录页面）
   */
  const handleOtherPhoneLogin = () => {
    if (!agreementChecked.value) {
      uni.showToast({ title: '请先同意服务协议', icon: 'none' })
      return
    }
    // 跳转到子组件
    isUseOtherNumber.value = true
    console.log('跳转其他手机号登录页面...')
  }

  onUnload(() => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null // ✅ 清理后置空
    }
  })
</script>

<style lang="scss" scoped>
  .login-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 60rpx 40rpx;
    box-sizing: border-box;
    background-color: #f6f8fa;

    .header-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 80rpx;
      margin-bottom: 120rpx;

      .logo-wrapper {
        width: 160rpx;
        height: 160rpx;
        border-radius: 24rpx;
        overflow: hidden;
        margin-bottom: 24rpx;

        .logo-img {
          width: 100%;
          height: 100%;
        }
      }

      .app-title {
        font-size: 40rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .action-section {
      // 按钮样式已直接在 template 的 style 中通过 CSS 变量控制
      display: flex;
      flex-direction: column;
      gap: 20rpx;
    }

    .agreement-section {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-top: 40rpx;
      gap: 12rpx;

      .agreement-text {
        font-size: 22rpx;
        color: #999;
        line-height: 1.6;
        background: transparent;
        flex: 1;
        word-break: break-all;

        .link {
          color: #00a8ff;
        }
      }
    }
  }
</style>
