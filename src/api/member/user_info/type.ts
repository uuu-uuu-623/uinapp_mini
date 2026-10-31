// 该文件用于管理 会员个人信息的请求参数和返回值的数据类型定义
import type { BaseUserInfo } from '../user_login/type'

// 请求 获取个人信息的 返回值数据类型定义
export interface userInfoDetailData extends BaseUserInfo {
  gender: genderEnum
  birthday: string | null
  // 省市区的名称
  fullLocation: string
  // 职业
  profession: string | null
}

export enum genderEnum {
  man = '男',
  woman = '女',
  undefined = '未知',
}

// 更新个人信息的请求参数 为什么不继承？  大多数变量为可选
export interface updateUserInfoParams {
  // 后台为可选  但这必选
  nickname: string
  // 生日 YYYY-MM-DD
  birthday?: null | string
  gender?: genderEnum | null
  profession?: string | null
  provinceCode?: string | null //省份编码
  cityCode?: string | null //城市编码
  countyCode?: string | null //区/县编码
}

// 请求更新成功个人信息 的返回值
export interface userInfoResultData extends userInfoDetailData {
  token: string
}

// 请求修改个人头像的返回值数据类型定义
export interface UpdateAvatarResult {
  avatar: string
}
