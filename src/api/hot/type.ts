// 该文件用于 热门推荐的api接口 接口返回值的数据类型定义

// 热门推荐的各个子模块 发请求所需的请求参数一致
export interface Hot_SonModel_Query {
  // 分页页码
  page?: number
  // 分页数据每页条数
  pageSize?: number
  // Tab 项的 id，默认查询全部 Tab 项的第 1 页数据
  subType?: string
}

// 每个商品的 数据类型定义
export interface good {
  // 商品描述
  desc: string
  // 商品id
  id: string
  // 商品名称
  name: string
  // 商品图片
  picture: string
  // 商品价格
  price: number
}

// 全部商品集合的 数据类型定义
export interface AllgoodsInfo {
  // 所有商品集合
  items: good[]
  // 商品总数量
  counts: string
  // 页码
  page: string
  // 总页数
  pages: string
  // 每页的容量
  pageSize: string
}

// 热门推荐的各个子模块的 tabs 标签项
// 请求不同的子模块的 tabs标签项 返回值类型定义
export interface SubType {
  // 不同的子模块中的 不同商品集合
  goodsItems: AllgoodsInfo
  // 子类选项id
  id: string
  // 子类选项名称
  title: string
}

// 请求热门推荐的各个子模块的
// result返回值数据类型定义
export interface DataFromHot_SonModel {
  // 活动图片
  bannerPicture: string
  // id信息
  id: string
  // 子类选项集合
  subTypes: SubType[]
  // 活动标题
  title: string
}
