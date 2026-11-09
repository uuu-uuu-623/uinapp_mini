// 该文件用于管理 支付模块的 返回值的数据类型定义
//
// 请求真实微信支付的返回值
export interface payResult {
  /** 时间戳，即当前的时间 */
  timeStamp: string
  /** 签名算法 */
  signType: string
  /** 统一下单接口返回的 prepay_id 参数值 */
  package: string
  /** 微信支付签名 */
  paySign: string
  /** 随机字符串，长度为32个字符以下 */
  nonceStr: string
  /** appId */
  appId?: string
}

// 使用uniapp框架给的跨端支付 请求参数 数据类型定义
// 微信支付
export interface WxPayParams {
  provider: 'wxpay'
  timeStamp: string
  nonceStr: string
  package: string // 注意：package 是 JS 保留字，对象键需加引号或直接用
  signType: 'MD5' | 'HMAC-SHA256' | 'RSA'
  paySign: string
}

// 支付宝支付
export interface AlipayParams {
  provider: 'alipay'
  orderInfo: string // 支付宝 SDK 返回的完整订单字符串
}

export type PayParams = WxPayParams | AlipayParams
