// 本文件用于总商品模块下的  商品详情页的api接口 返回值的数据类型定义

// 商品信息 result
export interface goodsInfo {
  id: string //商品id
  name: string //商品名字
  spuCode: string //spu编码
  desc: string //备注
  price: string //当前价格
  oldPrice: string //原价
  discount: number //折扣
  inventory: number //库存
  salesCount: number //销量
  commentCount: number //评价数量
  collectCount: number //收藏数量
  videoScale: number //主图视频比例,  1为1:1/16:9, 2为3:4
  isPreSale: boolean //是否为预售商品

  categories: categoryList[]
  details: Details //商品详情
  brand: brandInfo //品牌信息
  mainVideos: string[] //主图视频集合
  mainPictures: string[] //主图图片集合
  specs: specsInfo[] //可选规格集合
  skus: SkusList[] //sku集合
  //两个一样
  similarProducts: similarProductsList[] //同类商品
  hotByDay: similarProductsList[] //24小时热销

  evaluationInfo: null
  isCollect: null
  recommends: null
  userAddresses: null
}

// 一级、二级分类
export interface categoryList {
  id: string
  layer: number
  name: string
  parent: categoryList[]
}

// 品牌信息
export interface brandInfo {
  id: string //品牌id
  name: string //品牌名字
  nameEn: string //品牌英文名字
  picture: string //图片
  logo: string //品牌logo
  type: null
  desc: null
  place: null
}

// 可选规格集合
// 备注：规格集合一定要和skus集合下的specs 顺序保持一致
export interface specsInfo {
  id: string //某可选规格id
  name: string //某可选规格名字
  value: specsValueList[]
}

// 可选规格 - 可选值集合
export interface specsValueList {
  name: string //某可选值名称
  picture: string | null //可选值图片链接
  available?: boolean //是否可售
  desc: string //可选值备注
}

// sku集合
export interface SkusList {
  id: string //skuId
  skuCode: string //sku编码
  price: string //价格
  oldPrice: string //旧价格
  inventory: number //库存
  picture?: string //sku图片
  specs: specsInSku[]
}

// sku中 可选规格的值
export interface specsInSku {
  name: string //规格名称
  valueName: string //可选值名称
}

// 商品详情
export interface Details {
  properties: GoodsAttrList[]
  pictures: string[]
}

// 商品属性集合
export interface GoodsAttrList {
  name: string //属性名称
  value: string //属性值
}

export interface similarProductsList {
  id: string //商品id
  name: string //商品名字
  picture: string //商品图片url
  price: string //价格
  desc: string //备注
  orderNum: number //销量
  discount: null //折扣
}

// 评论数据
export interface evaluationInfo {
  // "系统默认好评"
  content: string
  // 评论发布时间
  createTime: string
  // 评论id
  id: string
  // 谁发的
  member: null
  officialReply: null
  orderInfo: null
  pictures: string[] | null
  praiseCount: 388
  praisePercent: 1
  score: 5
  tags: null
}
