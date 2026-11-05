// 该文件用于管理 订单模块的接口api
import { request } from '@/utils/request'
import type { PreOrder_BuyNowParams, PreOrderData, submitOrder_Params } from './type'

enum API {
  // 填写订单-获取预付订单
  Get_preOrder = '/member/order/pre',
  // 填写订单-获取立即购买订单
  Get_preOrder_BuyNow = '/member/order/pre/now',
  // 订单管理-提交订单
  Post_Order = '/member/order',
}

// 获取预付订单
export const reqPreOrder = () => {
  return request<PreOrderData>({
    url: API.Get_preOrder,
  })
}

// 获取立即购买订单
export const reqPreOrderBuyNow = (data: PreOrder_BuyNowParams) => {
  return request<PreOrderData>({
    url: `${API.Get_preOrder_BuyNow}?skuId=${data.skuId}&count=${data.count}&addressId=${data.addressId ?? ''}`,
  })
}

// 请求提交订单
export const reqsubmitOrder = (data: submitOrder_Params) => {
  // 返回值是订单id
  return request<{ id: string }>({
    url: API.Post_Order,
    method: 'POST',
    data,
  })
}
