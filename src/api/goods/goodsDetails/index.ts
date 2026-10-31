// 本文件用于总商品模块下的  商品详情页的api接口
import { request } from '@/utils/request'
import type { goodsInfo } from './type'
enum API {
  // 请求商品详情页的数据
  Get_GoodsDetail = '/goods',
}

export const reqGoodsDetail = (id: string) => {
  return request<goodsInfo>({
    url: `${API.Get_GoodsDetail}?id=${id}`,
  })
}
