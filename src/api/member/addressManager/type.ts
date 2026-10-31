// 该文件用于管理 会员中的 地址管理模块 的相关数据类型定义

// 是否为默认地址 -- 1为是，0为否
export type isDefault = 1 | 0

export interface sameData {
  // 收货人姓名
  receiver: string
  // 联系方式
  contact: string
  // 所在省份编码
  provinceCode: string
  // 所在城市编码
  cityCode: string
  // 所在区/县编码
  countyCode: string
  // 详细地址
  address: string
  // 是否为默认，1为是，0为否
  isDefault: isDefault
}

// 获取收货地址列表的 返回值 数据类型定义
// 请求 根据地址id获取收货地址详情 的返回值数据类型定义

export interface addressList_result extends sameData {
  // 收货地址id
  id: string
  // 省市区(县)
  fullLocation: string
}

// 请求添加或者修改收货地址的 请求参数
export interface addOrUpdateAddressParams extends sameData {}
