// 该文件用于 购物车模块的api接口
import { request } from '@/utils/request'
import type { addCartParams, addCartResult, cartList } from './type'

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
  return request<cartList[]>({
    url: API.CRUD_Cart,
  })
}
