// 该文件用于管理 会员登录的接口api
import { request } from '@/utils/request'
import type { loginParams, loginResult } from './type'

enum API {
  // 小程序登录api （需要企业appid,且把微信号添加到开发者列表中。）
  Post_Minlogin = '/login/wxMin',
  // 小程序模拟登录api （个人开发练习）
  Post_Minlogin_develop = '/login/wxMin/simple',
  // 刷新token
  Put_tokenRefresh = '/login/refresh',
}

// 小程序登录
export const reqMinLogin = (data: loginParams) => {
  return request<loginResult>({
    url: API.Post_Minlogin,
    method: 'POST',
    data,
  })
}

// 小程序模拟登录 个人开发练习
export const reqMinLoginDev = (phoneNumber: string) => {
  return request<loginResult>({
    url: API.Post_Minlogin_develop,
    method: 'POST',
    data: { phoneNumber },
  })
}
