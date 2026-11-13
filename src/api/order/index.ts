// 该文件用于管理 订单模块的接口api
import { request } from '@/utils/request'
import type { SafeAbortSignalType } from '@/utils/abort'
import type {
  PreOrder_BuyNowParams,
  PreOrderData,
  submitOrder_Params,
  orderDetailData,
  logistics,
  orderList_Params,
  orderList_result,
} from './type'

enum API {
  // 订单管理-请求订单的增删改查操作
  CRUD_order = '/member/order',
  // 填写订单-获取预付订单
  Get_preOrder = '/member/order/pre',
  // 填写订单-获取立即购买订单
  Get_preOrder_BuyNow = '/member/order/pre/now',
  // 填写订单-获取再次购买订单 (订单管理)
  Get_BuyAggin = '/member/order/repurchase',
  // 订单管理-取消订单  /member/order/{id}/cancel
  // 订单管理-确认收货 /member/order/{id}/receipt
  // 订单管理-获取订单物流 /member/order/{id}/logistics
  // （这几个接口与 CRUD_order 同前缀，直接复用，避免重复枚举值）
  // 模拟发货-开发环境 /member/order/consignment/{id}
  Get_MockConsignment = '/member/order/consignment',
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
    url: API.CRUD_order,
    method: 'POST',
    data,
  })
}

// 获取订单详情
export const reqOrderDetail = (orderId: string) => {
  return request<orderDetailData>({
    url: `${API.CRUD_order}/${orderId}`,
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
    url: `${API.CRUD_order}/${cancelParams.orderId}/cancel`,
    method: 'PUT',
    data: { cancelReason: cancelParams.cancelReason },
  })
}

// 请求发货 -模拟
export const reqMockConsignment = (orderId: string) => {
  return request({
    url: `${API.Get_MockConsignment}/${orderId}`,
  })
}

// 请求删除订单
export const reqDelOrder = (ids: string[]) => {
  return request({
    url: API.CRUD_order,
    method: 'DELETE',
    data: { ids },
  })
}

// 确认收货
export const reqReceiptOrder = (orderId: string) => {
  return request<orderDetailData>({
    url: `${API.CRUD_order}/${orderId}/receipt`,
    method: 'PUT',
  })
}

// 获取订单物流
export const reqLogistics = (orderId: string) => {
  return request<logistics>({
    url: `${API.CRUD_order}/${orderId}/logistics`,
  })
}

// 获取订单列表
// signal 为可选：下拉刷新时把它透传给 request，abort() 才能真正取消本次网络请求
export const reqOrderList = (
  { page, pageSize, orderState }: orderList_Params,
  signal?: SafeAbortSignalType,
) => {
  return request<orderList_result>({
    url: `${API.CRUD_order}?page=${page}&pageSize=${pageSize}&orderState=${orderState}`,
    signal,
  })
}
