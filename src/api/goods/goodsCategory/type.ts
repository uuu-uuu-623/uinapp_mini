// 本文件用于总商品模块下的  商品分类列表的数据类型定义

/**
 * 一级分类项
 */
export interface Result {
  // 二级分类集合
  children: Childs[]
  // 一级分类id
  id: string
  // 一级分类图片集
  imageBanners: string[]
  // 一级分类名称
  name: string
  // 一级分类图片
  picture: string
}

/**
 * 二级分类项
 */
export interface Childs {
  // 二级分类id
  id: string
  // 商品集合
  goods: Good[]
  // 二级分类图片url
  picture: string
  //  二级分类名称
  name: string

  // 值为null的 代表无
  brands: null
  categories: null
  parentId: null
  parentName: null
  saleProperties: null
}

/**
 * 商品项
 */
export interface Good {
  // 商品id
  id: string
  // 商品描述
  desc: string
  // 商品名称
  name: string
  orderNum: number
  // 商品图片
  picture: string
  // 商品价格
  price: string
  discount: null
}
