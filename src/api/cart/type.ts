// 该文件用于 购物车模块的api接口 请求参数和返回值的数据类型定义

// 请求加入购物车的 请求参数
export interface addCartParams {
  skuId: string
  count: number
}

// 请求加入购物车的 返回值
export interface addCartResult {
  // SPUID
  id: string
  // 商品名称
  name: string
  picture: string
  // 加入时价格
  price: number
  // 数量
  count: number
  // SKUID
  skuId: string
  // 属性文字，例如“颜色:瓷白色 尺寸：8寸”
  attrsText: string
  // 是否选中
  selected: boolean
  // 当前的价格
  nowPrice: number
  // 库存
  stock: number
  // 是否收藏
  isCollect: boolean
  // 折扣信息
  discount: number
  //是否为有效商品
  isEffective: boolean
}

// 获取购物车列表返回值
export type cartList = addCartResult
