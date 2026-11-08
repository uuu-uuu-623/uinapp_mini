// 该文件用于管理 订单模块的接口api
import { request } from '@/utils/request'
import type {
  PreOrder_BuyNowParams,
  PreOrderData,
  submitOrder_Params,
  orderDetailData,
} from './type'

enum API {
  // 填写订单-获取预付订单
  Get_preOrder = '/member/order/pre',
  // 填写订单-获取立即购买订单
  Get_preOrder_BuyNow = '/member/order/pre/now',
  // 订单管理-提交订单
  Post_Order = '/member/order',
  // 订单管理-获取订单详情
  Get_orderDetail = '/member/order',
  // 填写订单-获取再次购买订单 (订单管理)
  Get_BuyAggin = '/member/order/repurchase',
  // 订单管理-取消订单  /member/order/{id}/cancel
  Put_cancelOrder = '/member/order',
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

// 获取订单详情
export const reqOrderDetail = (orderId: string) => {
  return request<orderDetailData>({
    url: `${API.Get_orderDetail}/${orderId}`,
  })
}

// 获取再次购买订单 传递订单id
export const reqBuyAgginOrderData = (orderId: string) => {
  return request<PreOrderData>({
    url: `${API.Get_BuyAggin}/${orderId}`,
  })
}

// 取消订单
export const reqCancelOrder = (cancelParams: { orderId: string; cancelReason: string }) => {
  return request<orderDetailData>({
    url: `${API.Put_cancelOrder}/${cancelParams.orderId}/cancel`,
    method: 'PUT',
    data: { cancelReason: cancelParams.cancelReason },
  })
}
