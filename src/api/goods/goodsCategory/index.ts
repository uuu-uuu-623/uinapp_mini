// 本文件用于总商品模块下的  商品分类列表的api接口
import { request } from '@/utils/request'
import type { Result } from './type'

enum API {
  // 获取商品分类列表
  Get_goodsCategory = '/category/top',
}

export const reqGoodsCategory = () => {
  return request<Result[]>({
    url: API.Get_goodsCategory,
  })
}
