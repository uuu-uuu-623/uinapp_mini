// 用于地址模块数据相关的 仓库
import { addressList_result } from '@/api/member/addressManager/type'
import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useAddressStore = defineStore('addressStore', () => {
  // 用户在订单页面 跳转到地址管理页面选择的 收货地址
  const selectedAddress = ref<addressList_result | null>(null)

  // 当用户在地址管理页面 选择收货地址时的 处理函数
  const onChangeReceiveAddress = (address: addressList_result) => {
    selectedAddress.value = address
  }

  const resetData = () => {
    selectedAddress.value = null
  }

  return { selectedAddress, onChangeReceiveAddress, resetData }
})
