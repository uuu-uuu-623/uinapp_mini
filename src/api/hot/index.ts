// 该文件用于 热门推荐的api接口
import { request } from '@/utils/request'
import type { Hot_SonModel_Query, DataFromHot_SonModel } from './type'
import type { SafeAbortSignalType } from '@/utils/abort'

// 在热门推荐模块中 区别其子模块的方法
// 是首页模块中的HotPanel组件跳转传参 携带的type => "1","2","3","4"
// 所以 type关联的 title、url 如下
export const HOT_CONFIG = {
  '1': { title: '特惠推荐', url: '/hot/preference' },
  '2': { title: '爆款推荐', url: '/hot/inVogue' },
  '3': { title: '一站买全', url: '/hot/oneStop' },
  '4': { title: '新鲜好物', url: '/hot/new' },
} as const //常量 用作类型

// 类型从数据反推，不手写
export type HotType = keyof typeof HOT_CONFIG // '1'|'2'|'3'|'4'
// "获取值 HOT_CONFIG 的类型中，键为 HotType 所对应的值的类型"
export type HotConfig = (typeof HOT_CONFIG)[HotType]
// 获得某个模块的url
export type HotApi = HotConfig['url'] // '/hot/preference' | ...

// 根据 type 查询子模块的配置 - 采用非空断言
export const getHot_SonModel_Config = (type?: HotType): HotConfig => {
  return HOT_CONFIG[(type ?? '1') as HotType] ?? HOT_CONFIG['1']
}

// 请求：url 只接受 HotApi，页面传错编译期就报错
export const reqHotRecommend = (
  api: HotApi,
  signal: SafeAbortSignalType,
  params?: Hot_SonModel_Query,
) => {
  return request<DataFromHot_SonModel>({
    url: api,
    data: params ?? {},
    signal,
  })
}
