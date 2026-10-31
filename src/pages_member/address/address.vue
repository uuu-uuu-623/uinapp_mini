<template>
  <view class="address">
    <view @click="closeOutside" class="addressList">
      <wd-swipe-action v-for="item in addressList" :key="item.id">
        <wd-cell border value-align="left" ellipsis>
          <template #default>
            <view class="addressBox">
              <view class="consignee">
                <text>{{ item.receiver }}</text>
                <view class="default" v-if="item.isDefault === 1">默认</view>
              </view>
              <view class="addressBar">{{ item.fullLocation }} {{ item.address }}</view>
            </view>
          </template>
        </wd-cell>
        <template #right>
          <view class="action">
            <view class="button" style="background: #ffb300" @click="handleAction(item.id, 1)">
              修改
            </view>
            <view class="button" style="background: #e2231a" @click="handleAction(item.id)">
              删除
            </view>
          </view>
        </template>
      </wd-swipe-action>
    </view>

    <wd-button icon="plus" round custom-class="btn" @click="addNewAddress">新增地址</wd-button>
  </view>

  <!-- 对话框 -->
  <wd-dialog />
  <wd-toast />
</template>

<script lang="ts" setup>
  import { reqGetAddressList, reqDelAddress } from '@/api/member/addressManager'
  import type { addressList_result } from '@/api/member/addressManager/type'
  import { onShow, onLoad } from '@dcloudio/uni-app'
  import { useDialog, useQueue, useToast } from '@wot-ui/ui/composables'
  import { ref } from 'vue'

  const { closeOutside } = useQueue()
  const dialog = useDialog()
  const toast = useToast()

  // 数据加载状态
  const loading = ref(false)

  // 存储 请求得到的所有收货地址
  const addressList = ref<addressList_result[]>([])

  // 请求得到地址列表参数
  const getAddressList = async () => {
    if (loading.value) return
    loading.value = true
    try {
      const res = await reqGetAddressList()
      addressList.value = res
    } catch (error) {
    } finally {
      loading.value = false
    }
  }

  onShow(async () => {
    await getAddressList()
  })

  onLoad(async () => {
    await getAddressList()
  })

  // 滑动组件的 两个操作 回调函数
  const handleAction = async (id: string, action?: number) => {
    // 如果有action且为1  则是跳转页面做修改操作
    if (action === 1) {
      //  修改则跳转到修改页
      uni.navigateTo({ url: `/pages_member/AddressForm/AddressForm?id=${id}` })
      return
    }

    // 其他 = 删除
    try {
      // 展示dialog 对话框
      await dialog.confirm({
        iconProps: { name: 'delete', size: '50rpx' },
        title: '确定删除吗?',
        showClose: true,
        beforeConfirm: async () => {
          toast.loading('删除中...')
          try {
            const res = await reqDelAddress(id)
            if (!res.id) {
              toast.error('删除失败')
              return false // 不关闭对话框，让用户可重试
            }
            toast.success('删除成功')
            await getAddressList() // 刷新列表
            return true // 关闭对话框
          } catch (error) {
            toast.error('删除失败')
            return false
          } finally {
            toast.close() // 无论成功失败都关 loading
          }
        },
      })
    } catch (error) {
      return false
    }
  }

  // 点击新增地址的回调函数
  const addNewAddress = () => {
    uni.navigateTo({ url: `/pages_member/AddressForm/AddressForm` })
  }
</script>

<style scoped lang="scss">
  .action {
    height: 100%;
    display: flex;
  }

  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 24rpx;
    height: 100%;
    color: #fff;
    font-size: 28rpx;
    white-space: nowrap;
  }

  .address {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
    padding: 24rpx;

    .addressList {
      background: #f5f6fa;
      border-radius: 10rpx;
      box-sizing: border-box;
      box-shadow: 0 4rpx 16rpx rgb(0 0 0 / 6%);

      // 地址相关
      .addressBox {
        display: flex;
        flex-direction: column;
        gap: 20rpx;

        // 收货人
        .consignee {
          display: flex;
          align-items: center;
          gap: 26rpx;
          font-size: 32rpx;
          color: #333;

          .default {
            padding: 0 14rpx;
            border: 1px solid rgb(81 81 249);
            border-radius: 10rpx;
            font-size: 24rpx;
            color: rgb(81 81 249);
          }
        }

        // 地址栏
        .addressBar {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 28rpx;
          color: #837d7d;
        }
      }
    }

    :deep(.btn) {
      position: fixed;
      bottom: 60rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
    }
  }
</style>
