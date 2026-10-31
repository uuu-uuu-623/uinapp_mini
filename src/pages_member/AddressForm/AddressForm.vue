<template>
  <view class="nav">
    <wd-navbar left-arrow safe-area-inset-top custom-class="navbar" @click-left="back">
      <template #title>
        <view class="title">{{ addressId ? '修改地址' : '新增地址' }}</view>
      </template>
    </wd-navbar>
  </view>

  <view class="form">
    <wd-card>
      <template #default>
        <wd-form ref="formRef" :schema="rules" :model="model" :title-width="100" border>
          <wd-form-item title="收货人" prop="receiver">
            <wd-input type="text" v-model="model.receiver" placeholder="请输入收货人姓名" />
          </wd-form-item>

          <wd-form-item title="手机号码" prop="contact">
            <wd-input type="text" v-model="model.contact" placeholder="请输入收货人手机号码" />
          </wd-form-item>

          <!-- 所在地区 -->
          <wd-form-item
            prop="fullLocation"
            title="所在地区"
            is-link
            placeholder="请选择省/市/区(县)"
            :value="model.fullLocation"
            @click="cascaderVisible = true"
          />

          <wd-form-item title="详细地址" prop="address">
            <wd-textarea
              type="text"
              v-model="model.address"
              placeholder="街道、楼牌号等信息"
              auto-height
              clearable
              clear-trigger="focus"
            />
          </wd-form-item>

          <wd-form-item title="设为默认地址" prop="isDefault" value-align="right">
            <template #default>
              <wd-switch v-model="swicthValue" size="40rpx" @change="onChangeSwitch" />
            </template>
          </wd-form-item>
        </wd-form>
      </template>
    </wd-card>
  </view>
  <view style="padding: 20rpx 30rpx 0">
    <wd-button
      type="primary"
      block
      round
      :loading="submitLoading"
      @click="submit"
      :disabled="submitLoading"
    >
      保存
    </wd-button>
  </view>

  <!-- 地区选择器 -->
  <wd-cascader
    v-model="cascaderValue"
    v-model:visible="cascaderVisible"
    :options="areaOptions"
    safe-area-inset-bottom
    @confirm="onAreaConfirm"
  />
</template>

<script lang="ts" setup>
  import { ref, computed, nextTick } from 'vue'
  import type { addOrUpdateAddressParams } from '@/api/member/addressManager/type'
  import { useAreaData } from '@/utils/areaData'
  import { FormSchema } from '@wot-ui/ui'
  import { FormInstance } from '@wot-ui/ui/components/wd-form/types'
  import { CascaderOption } from '@wot-ui/ui/components/wd-cascader/types'
  import {
    reqAdd_Address,
    reqGetaddressDetailBy_Id,
    reqUpdateAddress,
  } from '@/api/member/addressManager'
  import { onUnload, onLoad } from '@dcloudio/uni-app'

  const model = ref<addOrUpdateAddressParams & { fullLocation?: string }>({
    receiver: '',
    contact: '',
    provinceCode: '', //省
    cityCode: '', //市
    countyCode: '', //区
    address: '', //详细地址
    isDefault: 0,
    fullLocation: '',
  })

  // 收集跳转页面传参的数据 id
  const addressId = ref<string>('')

  // 表单的ref值
  const formRef = ref<FormInstance>()

  // 获取中国地区的值
  const areaOptions = useAreaData()
  // 展示地区选择器
  const cascaderVisible = ref(false)
  // 选择的地区的值
  const cascaderValue = ref<string[]>([])

  // 开关选择器的值
  const swicthValue = computed(() => {
    if (model.value.isDefault === 1) {
      return true
    } else {
      return false
    }
  })

  // 保存按钮 加载值
  const submitLoading = ref(false)

  // 根据地址id 获取收货地址详情的函数
  const getAddressDetailById = async (addressId: string) => {
    try {
      const res = await reqGetaddressDetailBy_Id(addressId)

      const { id, ...resultData } = res
      Object.assign(model.value, resultData)

      // 在 model 更新之后，再设置级联选择器的值
      if (res.provinceCode && res.cityCode && res.countyCode) {
        await nextTick()
        cascaderValue.value = [res.provinceCode, res.cityCode, res.countyCode]
      }
    } catch (error) {
      uni.showToast({ icon: 'fail', title: '请求失败，请重试' })
    }
  }

  onLoad(async (options) => {
    if (options?.id) {
      addressId.value = options.id
      await getAddressDetailById(addressId.value)
    }
  })

  // 确定选择地区 的回调函数
  const onAreaConfirm = ({
    selectedOptions,
  }: {
    value: string
    selectedOptions: CascaderOption[]
  }) => {
    // console.log(selectedOptions)
    // 收集收货地址
    model.value.fullLocation = selectedOptions.map((item) => item.text).join(' ')

    // 收集省市区的编码
    model.value.provinceCode = selectedOptions[0]?.value as string
    model.value.cityCode = selectedOptions[1]?.value as string
    model.value.countyCode = selectedOptions[2]?.value as string

    cascaderVisible.value = false
  }

  // 当改变开关选择器的值
  const onChangeSwitch = ({ value }: { value: any }) => {
    // console.log(value) true or false
    model.value.isDefault = value ? 1 : 0
  }

  // ========= 表单校验规则 ==========
  const rules: FormSchema = {
    validate(formModel) {
      // 全都必填 除了开关
      const issues: { path: string[]; message: string }[] = []

      // 收货人
      const receiver = String(formModel?.receiver ?? '').trim()
      if (!receiver) {
        issues.push({ path: ['receiver'], message: '请填写收货人姓名' })
      } else if (receiver.length < 1 || receiver.length > 20) {
        issues.push({ path: ['receiver'], message: '收货人姓名长度为1-20个字符' })
      }

      // 手机号
      const contact = String(formModel?.contact ?? '').trim()
      const test = /^1[3-9][0-9]{9}$/.test(contact)
      if (!contact) {
        issues.push({ path: ['contact'], message: '请填写手机号码' })
      } else if (!test) {
        issues.push({ path: ['contact'], message: '请输入正确的手机号' })
      }

      // 省市区（用 fullLocation 校验）
      const fullLocation = String(formModel?.fullLocation ?? '').trim()
      if (!fullLocation) {
        issues.push({ path: ['fullLocation'], message: '请选择所在地区' })
      }

      // 详细地址
      const address = String(formModel?.address ?? '').trim()
      if (!address) {
        issues.push({ path: ['address'], message: '请填写详细地址' })
      } else if (address.length < 5 || address.length > 100) {
        issues.push({ path: ['address'], message: '详细地址长度为5-100个字符' })
      }

      return issues
    },
  }

  // 定时器id
  let timer: ReturnType<typeof setTimeout> | null = null
  // 抽取公共操作
  const handleSaveWithSuccess = () => {
    uni.showToast({ icon: 'success', title: '保存成功' })
    // 定时器还存在 则去掉定时器
    if (timer !== null) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      uni.navigateBack({ delta: 1 })
      timer = null // 执行完毕后置空
    }, 1200)
  }

  // 保存按钮的回调
  const submit = async () => {
    if (!formRef.value || submitLoading.value) return

    // 校验成功之后放行
    try {
      const result = await formRef.value?.validate()
      if (!result.valid) {
        return
      }
    } catch (error) {
      // 有错误则直接结束
      return
    }

    try {
      submitLoading.value = true
      // 手动解构 去除多余字段fullLocation
      const { fullLocation, ...queryParams } = model.value

      const res = addressId.value
        ? await reqUpdateAddress(addressId.value, queryParams)
        : await reqAdd_Address(queryParams)

      // 新增地址得到的是新增地址的id
      if (res.id) handleSaveWithSuccess()
    } catch (error) {
      uni.showToast({ icon: 'error', title: '保存失败' })
    } finally {
      submitLoading.value = false
    }
  }

  // 返回上一页
  const back = () => {
    uni.navigateBack({ delta: 1 })
  }

  onUnload(() => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null // 清理后置空
    }
  })
</script>

<style scoped lang="scss">
  .nav {
    width: 750rpx;
  }

  .title {
    font-size: 28rpx;
    color: #3f3e3e;
    font-weight: 500;
  }

  .form {
    margin: 40rpx 0;
  }
</style>
