// 该文件用于 首页的api接口
import { request } from '@/utils/request'
import type {
  DataFromBanner,
  DataFromCategoryMutli,
  DataFromHotMulti,
  DataFromGuessLike,
  pageInfo,
} from './type'
// 引入信号层类型
import { type SafeAbortSignalType } from '@/utils/abort'

enum API {
  // 首页或者是商品分类页 请求得到轮播图数据
  Get_Banner = '/home/banner',
  // 请求得到 首页-前台分类 (小程序 只查询一级类目信息)
  Get_categoryMutli = '/home/category/mutli',
  // 请求得到 首页-热门推荐
  Get_HotMutli = '/home/hot/mutli',
  // 首页或者 我的信息页 请求得到猜你喜欢模块的数据
  Get_GuessLike = '/home/goods/guessLike',
}

// 首页或者是商品分类页 请求得到轮播图数据
// 1 为首页（默认值）
// 2 为商品分类页
export const reqBannerInHomeOrGoods = (distributionSite = 1) => {
  return request<DataFromBanner[]>({
    url: `${API.Get_Banner}?distributionSite=${distributionSite}`,
  })
}

// 请求得到 首页-前台分类
export const reqCategoryMutli = () => {
  return request<DataFromCategoryMutli[]>({
    url: API.Get_categoryMutli,
  })
}

// 请求得到 首页-热门推荐
export const reqHotMutli = () => {
  return request<DataFromHotMulti[]>({
    url: API.Get_HotMutli,
  })
}

// 首页或者 我的信息页 请求得到猜你喜欢模块的数据
export const reqGuessLike = (signal: SafeAbortSignalType, config?: pageInfo) => {
  return request<DataFromGuessLike>({
    url: API.Get_GuessLike,
    data: config || {},
    signal,
  })
}
