// 该文件用于管理 会员个人信息的接口api
import { request } from '@/utils/request'
import type { userInfoDetailData, updateUserInfoParams, userInfoResultData } from './type'
import { upload } from '@/utils/fileUpload'

enum API {
  // 获取个人信息
  Get_userInfo = '/member/profile',
  // 修改个人信息
  Put_userInfo = '/member/profile',
  // 修改用户头像
  Post_userAvatar = '/member/profile/avatar',
}

// 请求获取用户信息
export const reqUserInfo = () => {
  return request<userInfoDetailData>({
    url: API.Get_userInfo,
  })
}

// 请求更新 个人信息
export const reqUpdateUserInfo = (data: updateUserInfoParams) => {
  return request<userInfoResultData>({
    method: 'PUT',
    url: API.Put_userInfo,
    data,
  })
}

// 请求修改用户头像  - 黑马接口禁用了 不可上传更改图片
export const reqUpdateAvatar = (filePath: string) => {
  return upload({
    url: API.Post_userAvatar,
    filePath: filePath,
    name: 'file',
  })
}
