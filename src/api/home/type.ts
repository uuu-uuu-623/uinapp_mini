// 该文件用于 首页的api接口 接口返回值的数据类型定义
// 无接口返回值中的 - code、msg、result的类型定义  因为已经在request中处理

// 轮播图 数据类型定义
export interface DataFromBanner {
  id: string
  imgUrl: string
  hrefUrl: string
  type: number
}

// 前台分类 数据类型定义
export interface DataFromCategoryMutli {
  // 展示图标
  icon: string
  // id
  id: string
  // 分类名称
  name: string
}

// 热门推荐 数据类型定义
export interface DataFromHotMulti {
  id: string
  // 推荐说明
  alt: string
  //图片集合
  pictures: string[]
  //跳转地址
  target: string
  // 推荐标题
  title: string
  //推荐类型
  type: string
}

// 主页或者我的信息页 - 猜你喜欢模块 数据类型定义
export interface DataFromGuessLike {
  // 总条数
  counts: number
  // 当前页数据
  items: Item_DataFromGuessLike[]
  // 当前页数
  page: number
  // 总页数
  pages: number
  // 每页条数
  pageSize: number
}

// DataFromGuessLike 中的items - 当前页的数据
export interface Item_DataFromGuessLike {
  // 商品描述
  desc: string
  // 商品折扣
  discount: number
  // id
  id: string
  // 商品名称
  name: string
  // 商品已下单数量
  orderNum: number
  // 商品图片
  picture: string
  // 商品价格
  price: number
}

// 用于 猜你喜欢模块 发送分页信息的请求 分页参数的数据类型定义
export interface pageInfo {
  page: number //当前页码 默认 1
  pageSize: number //每页条数 默认 10
}
