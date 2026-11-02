// 该文件用于 购物车模块的api接口
import { request } from '@/utils/request'
import type { addCartParams, addCartResult, CartList, UpdateCartParams } from './type'

enum API {
  // 请求添加购物车
  CRUD_Cart = '/member/cart',
  // 购物车全选/取消全选
  Put_CartSelectAll = '/member/cart/selected',
}

// 请求添加购物车
export const reqAddCart = (data: addCartParams) => {
  return request<addCartResult>({
    url: API.CRUD_Cart,
    method: 'POST',
    data,
  })
}

// 请求获取购物车列表
export const reqCartList = () => {
  return request<CartList[]>({
    url: API.CRUD_Cart,
  })
}

// 请求删除或者清空购物车
export const reqDelCart = (skuIds: Array<string>) => {
  return request<{ msg: string }>({
    url: API.CRUD_Cart,
    method: 'DELETE',
    data: { ids: skuIds },
  })
}

// 请求修改购物车单品
export const reqUpdateCart = (skuId: string, data: UpdateCartParams) => {
  return request<CartList>({
    url: `${API.CRUD_Cart}/${skuId}`,
    method: 'PUT',
    data,
  })
}

// 请求全选和取消全选
export const reqCartCheckedAll = (selected: boolean) => {
  return request<{ msg: string; result: {} }>({
    url: API.Put_CartSelectAll,
    method: 'PUT',
    data: { selected },
  })
}
