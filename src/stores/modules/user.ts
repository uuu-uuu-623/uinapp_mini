// 用户信息相关仓库
// 引用封装的本地存储
import { storage } from '@/utils/storage'
import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
// 得到用户数据类型
import type { loginResult, UserInfo, loginParams } from '@/api/member/user_login/type'
import { reqMinLogin, reqMinLoginDev } from '@/api/member/user_login'
// 获取 用户个人信息页的数据 - 个人信息
import { reqUpdateUserInfo, reqUserInfo, reqUpdateAvatar } from '@/api/member/user_info'
import type { updateUserInfoParams, userInfoDetailData } from '@/api/member/user_info/type'

export const useUserStore = defineStore('userStore', () => {
  // 获取token值
  const token = ref<string>(storage.get<string>('token') || '')
  // 这个用户信息 剔除了后端返回的token值 token值单独存储
  const userInfo = ref<UserInfo | null>(storage.get<UserInfo>('userInfo') || null)

  // 更改个人信息页的 用户个人信息详细数据
  const userDetailInfo = ref<userInfoDetailData | null>(null)

  // 通过计算 判断用户是否登录
  const isLogin = computed(() => (token.value ? true : false))

  // 监听token的值
  // 变化则重新设置val  如果val不存在 则清空
  watch(token, (newV) => {
    if (newV) {
      storage.set('token', newV)
    } else {
      storage.remove('token')
    }
  })

  // 监听用户信息变化  只存储用户简单信息 不存储详细信息
  watch(
    userInfo,
    (val) => {
      if (val) {
        storage.set('userInfo', val)
      } else {
        storage.remove('userInfo')
      }
    },
    { deep: true },
  )

  // 发送请求 登陆小程序 真实开发登录
  const login = async (data: loginParams) => {
    try {
      const res: loginResult = await reqMinLogin(data)
      // 存储时剔除 token，只保存纯用户信息
      const { token: T, ...info } = res
      userInfo.value = info as UserInfo
      token.value = T
    } catch {
      uni.showToast({ icon: 'error', title: '登陆失败' })
    }
  }

  // 发送请求 模拟小程序登录
  const loginDev = async (phoneNumber: string) => {
    const test = /^1[3-9][0-9]{9}$/.test(phoneNumber)
    if (!test || !phoneNumber) {
      uni.showToast({ icon: 'none', title: '请输入正确的手机号' })
      return new Error('手机号错误')
    }
    try {
      const res: loginResult = await reqMinLoginDev(phoneNumber)
      // 存储时剔除 token，只保存纯用户信息
      const { token: T, ...info } = res
      userInfo.value = info as UserInfo
      token.value = T
    } catch {
      uni.showToast({ icon: 'error', title: '登陆失败' })
    }
  }

  // 退出登录
  const logout = () => {
    token.value = ''
    userInfo.value = null
    userDetailInfo.value = null // 同步清空内存缓存
    storage.clear()
  }

  // 请求获取用户个人信息
  const getUserInfo = async () => {
    const res: userInfoDetailData = await reqUserInfo()
    userDetailInfo.value = res
  }

  // 请求更新 个人信息
  const UpdateUserInfo = async (data: updateUserInfoParams) => {
    const res = await reqUpdateUserInfo(data)
    if (userInfo.value) {
      userInfo.value.nickname = res.nickname ?? null
    }
  }

  // 请求更新头像  - 黑马接口禁用了 不可上传更改图片
  const UpdateUserAvatar = async (filePath: string) => {
    const res = await reqUpdateAvatar(filePath)
    if (userInfo.value) userInfo.value.avatar = res.avatar ?? ''
  }

  return {
    login,
    token,
    userInfo,
    isLogin,
    loginDev,
    logout,
    getUserInfo,
    userDetailInfo,
    UpdateUserInfo,
    UpdateUserAvatar,
  }
})
