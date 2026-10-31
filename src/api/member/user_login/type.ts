// 该文件用于管理 会员登录的请求参数和返回值的数据类型定义

// 小程序登录 企业
export interface loginParams {
  // code 通过 wx.login() 获取
  code: string
  // 通过 getphonenumber 事件回调中获取
  encryptedData: string
  // 通过 getphonenumber 事件回调中获取
  iv: string
}

// 暴露给user_info文件type 类型文件
export interface BaseUserInfo {
  id: number | string
  nickname: string | null
  avatar: string
  account: string
}

// 登录返回值 数据类型定义
export interface loginResult extends BaseUserInfo {
  mobile: string
  // 用于后续接口调用的token，有效期三天
  token: string
}

// 利用 Omit 提取用户信息类型（排除 token，避免冗余存储）
export type UserInfo = Omit<loginResult, 'token'>
