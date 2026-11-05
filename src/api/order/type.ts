// 该文件用于管理 订单模块的 请求参数和返回值的数据类型定义

// 获取预付订单的返回值数据类型定义
export interface PreOrderData {
  userAddresses: userAddress[]
  goods: good[]
  summary: summary
}

// 预付订单数据类型
/**用户地址信息*/
export interface userAddress {
  id: string
  provinceCode: string
  cityCode: string
  countyCode: string
  // 详细地址
  address: string
  // 是否为默认，1为是，0为否
  isDefault: number
  // 收货人
  receiver: string
  // 手机号
  contact: string
  // 完整行政区
  fullLocation: string
  // 邮编
  postalCode: string
}

/** 商品信息 */
export interface good {
  /**属性文字，例如“颜色:瓷白色 尺寸：8寸”*/
  attrsText: string
  /**数量*/
  count: number
  /**id*/
  id: string
  /**商品名称*/
  name: string
  /**实付单价*/
  payPrice: number
  /**图片*/
  picture: string
  /**原单价*/
  price: number
  /**SKUID*/
  skuId: string
  /**实付价格小计*/
  totalPayPrice: number
  /**小计总价*/
  totalPrice: number
}

/** 费用统计 */
export interface summary {
  /**
   * 折扣总计
   */
  discountPrice: number
  /**
   * 商品件数
   */
  goodsCount: number
  /**
   * 邮费
   */
  postFee: number
  /**
   * 应付总计
   */
  totalPayPrice: number
  /**
   * 价格总计
   */
  totalPrice: number
}

// 请求参数的共同数据
export interface Params_goodsSameData {
  // skuId
  skuId: string
  // 购买商品的数量
  count: string | number
}

// 请求获取立即购买订单 的请求参数 数据类型定义
export interface PreOrder_BuyNowParams extends Params_goodsSameData {
  // 下单时已经选择好的地址id
  addressId?: string
}

// 请求提交订单的请求参数 数据类型定义
export interface submitOrder_Params {
  goods: Params_goodsSameData[]
  // 所选地址Id
  addressId: string
  // 配送时间类型，1为不限，2为工作日，3为双休或假日
  deliveryTimeType: 1 | 2 | 3
  // 支付方式，1为在线支付，2为货到付款
  payType: 1 | 2
  // 支付渠道，1支付宝、2微信--支付方式为在线支付时，传值，为货到付款时，不传值
  payChannel: 1 | 2
  // 买家留言
  buyerMessage: string
}
