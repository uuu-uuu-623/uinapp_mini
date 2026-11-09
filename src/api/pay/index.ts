// 该文件用于管理 支付模块的接口api
import { request } from '@/utils/request'
import type { payResult } from './type'

enum API {
  // 获取微信支付参数 - 生产环境
  Get_wxPay = '/pay/wxPay/miniPay',
  // 模拟支付 - 测试环境
  Get_MockPay = '/pay/mock',
}

// 黑马给的是 微信支付的接口
// 请求真实支付
export const reqPay = (orderId: string) => {
  return request<payResult>({
    url: `${API.Get_wxPay}?orderId=${orderId}`,
  })
}

// 模拟支付
export const reqMockPay = (orderId: string) => {
  return request({
    url: `${API.Get_MockPay}?orderId=${orderId}`,
  })
}
