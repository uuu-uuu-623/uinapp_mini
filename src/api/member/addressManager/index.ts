// 该文件用于管理 会员中的 地址管理模块 的接口api
import { request } from '@/utils/request'
import type { addressList_result, addOrUpdateAddressParams } from './type'
enum API {
  // 获取收货地址列表
  // 添加收货地址
  // 根据地址id 获取或者删除收货地址详情 后面加上id路径
  address = '/member/address',
}

/** 获取收货地址列表 */
export const reqGetAddressList = () => {
  return request<addressList_result[]>({
    url: API.address,
    method: 'GET',
  })
}

/** 添加收货地址 */
export const reqAdd_Address = (data: addOrUpdateAddressParams) => {
  return request<{ id: string }>({
    url: API.address,
    method: 'POST',
    data,
  })
}

/* 根据地址id 获取收货地址详情 */
export const reqGetaddressDetailBy_Id = (id: string) => {
  return request<addressList_result>({
    url: `${API.address}/${id}`,
  })
}

/*更新地址信息*/
export const reqUpdateAddress = (id: string, data: addOrUpdateAddressParams) => {
  return request<{ id: string }>({
    url: `${API.address}/${id}`,
    method: 'PUT',
    data,
  })
}

/*删除地址*/
export const reqDelAddress = (id: string) => {
  return request<{ id: string }>({
    url: `${API.address}/${id}`,
    method: 'DELETE',
  })
}
