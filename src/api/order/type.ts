// 该文件用于管理 订单模块的 请求参数和返回值的数据类型定义

// 获取预付订单的返回值数据类型定义
export interface PreOrderData {
  userAddresses: userAddress[]
  goods: good[]
  summary: summary
}

// ============== 预付订单数据类型 ================
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

// 订单管理 获取订单详情的返回值数据类型定义
export interface orderDetailData extends orderDetail {
  skus: orderDetail_skus[]
}

// 订单返回值详细数据定义
export interface orderDetail {
  /**订单编号 */
  id: string
  /**下单时间 */
  createTime: string
  /**支付方式，1为在线支付，2为货到付款 */
  payType: number
  /**订单状态 1为待付款、2为待发货、3为待收货、4为待评价、5为已完成、6为已取消*/
  orderState: number
  /**付款截止时间：剩余的秒数，前台转换成分钟：秒数 */
  payLatestTime: number
  /**倒计时--剩余的秒数 -1 表示已经超时，正数表示倒计时未结束 */
  countdown: number
  /**邮费 */
  postFee: string
  /**实付金额 */
  payMoney: string
  /**支付渠道，1支付宝、2微信 */
  payChannel: number
  /**金额合计 */
  totalMoney: string
  /**数量合计 */
  totalNum: string
  /**配送时间类型，1为不限，2为工作日，3为双休或假日 */
  deliveryTimeType: number
  /**收货人 */
  receiverContact: string
  /**收货人手机 */
  receiverMobile: string
  /**收货人地址 */
  receiverAddress: string
  /**付款时间 */
  payTime: string | null
  /**发货时间 */
  consignTime: string | null
  /**预计到货时间 */
  arrivalEstimatedTime: string | null
  /**交易完成时间 */
  endTime: string | null
  /**交易关闭时间 */
  closeTime: string | null
  /**完成评价时间 */
  evaluationTime: string | null
}

/**订单状态枚举 -
 * 1为待付款、2为待发货、3为待收货、4为待评价、5为已完成、6为已取消 */
export enum orderStateEnum {
  /** 待付款 */
  DaiFuKuan = 1,
  /** 待发货 */
  DaiFaHuo = 2,
  /** 待收货 */
  DaiShouHuo = 3,
  /** 待评价 */
  DaiPingJia = 4,
  /** 已完成 */
  YiWanCheng = 5,
  /** 已取消 */
  YiQuXiao = 6,
}

// 订单详情中skus 数据类型定义
/** 商品集合 */
export interface orderDetail_skus {
  /**sku id */
  id: string
  /**spuId */
  spuId: string
  /**属性说明 */
  attrsText: string
  /** 商品名称*/
  name: string
  /**数量 */
  quantity: string
  /**图片地址 */
  image: string
  /**小计 */
  totalMoney: number | null
  /**实付金额 */
  realPay: number
  /**单价 */
  curPrice: number
  /** 属性集合 */
  properties: attrList[]
}

// 订单详情中skus的properties 属性集合 数据类型定义
export interface attrList {
  /** 属性名称，如 颜色*/
  propertyMainName: string
  /** 属性值名称，如 黑色*/
  propertyValueName: string
}

// 物流信息
/**订单物流 */
export interface logistics {
  /**商品图片 */
  picture: string
  /**商品件数 */
  count: number
  /**快递公司 */
  company: {
    /**公司名称 */
    name: string
    /**快递编号 */
    number: string
    /**联系电话 */
    tel: string
  }
  /**物流日志*/
  list: logisticsInfo[]
}

// 物流日志
export interface logisticsInfo {
  /**信息ID */
  id: string
  /**信息文字 */
  text: string
  /**时间 */
  time: string
}
