<template>
  <wd-card>
    <wd-form
      :model="model"
      :schema="rules"
      :validate-trigger="['blur', 'submit']"
      ref="formRef"
      hide-asterisk
      title-width="80px"
    >
      <wd-cell-group custom-class="group" value-align="left">
        <wd-form-item title="账号" prop="account">
          <wd-input v-model="model.account" placeholder="账号名" readonly />
        </wd-form-item>
        <wd-form-item title="昵称" border prop="nickname">
          <wd-input
            type="text"
            placeholder="请填写名称"
            :maxlength="15"
            show-word-limit
            v-model="model.nickname"
            clearable
            clear-trigger="focus"
            focus-when-clear
            enable-native
          />
        </wd-form-item>
        <wd-form-item title="性别" border>
          <wd-radio-group v-model="model.gender" allow-uncheck direction="horizontal">
            <wd-radio :value="genderEnum.man">男</wd-radio>
            <wd-radio :value="genderEnum.woman">女</wd-radio>
          </wd-radio-group>
        </wd-form-item>
        <!-- 出生日期 -->
        <wd-form-item
          :value="model.birthday"
          title="出生日期"
          border
          prop="birthday"
          is-link
          placeholder="请选择日期"
          @click="showDatePicker = true"
        ></wd-form-item>
        <!-- 城市 -->
        <wd-form-item
          prop="fullLocation"
          title="城市"
          border
          is-link
          :value="model.fullLocation"
          placeholder="请选择城市"
          @click="cascaderVisible = true"
        ></wd-form-item>
        <wd-form-item title="职业" border prop="profession">
          <wd-input
            type="text"
            placeholder="请填写职业"
            v-model="model.profession"
            :maxlength="15"
            show-word-limit
            focus-when-clear
          />
        </wd-form-item>
      </wd-cell-group>
    </wd-form>
  </wd-card>

  <view style="padding: 20rpx 30rpx 0">
    <wd-button type="primary" block round @click="submit" :loading="submitLoading">保存</wd-button>
  </view>

  <!-- 日期选择器 -->
  <wd-datetime-picker
    v-model="timePick"
    v-model:visible="showDatePicker"
    type="date"
    title="出生日期"
    :min-date="minDate"
    :max-date="maxDate"
    safe-area-inset-bottom
    close-on-click-modal
    @confirm="onDateConfirm"
  />

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
  import {
    genderEnum,
    updateUserInfoParams,
    type userInfoDetailData,
  } from '@/api/member/user_info/type'
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { useUserStore } from '@/stores/modules/user'
  import dayjs from 'dayjs'
  import { useAreaData } from '@/utils/areaData'
  import { CascaderOption } from '@wot-ui/ui/components/wd-cascader/types'
  import { FormSchema } from '@wot-ui/ui'
  import { FormInstance } from '@wot-ui/ui/components/wd-form/types'

  const userStore = useUserStore()

  // 提交按钮的加载状态
  const submitLoading = ref(false)
  // 请求数据的 加载状态
  const loading = ref(false)

  const formRef = ref<FormInstance>()

  const model = ref({
    account: '',
    nickname: '',
    gender: genderEnum.undefined,
    birthday: '',
    id: 0,
    // 省市区的名称
    fullLocation: '',
    // 职业
    profession: '',
  })

  // 当前时间 max-date
  const maxDate = ref<number>(Date.now())
  // 最小时间
  const minDate = ref<number>(Date.UTC(2000, 0, 1))
  const showDatePicker = ref(false)
  // 时间选择器 双向绑定时间
  const timePick = ref<number>(Date.now())

  // 地区数据
  // 一行代码获取完整的省市区树形数据
  const areaOptions = useAreaData()
  // 是否展示 级联选择器
  const cascaderVisible = ref(false)
  // 双向绑定 地区值
  const cascaderValue = ref('')

  // 地区编码 用于发送修改个人信息请求
  const regionCode = ref<{
    provinceCode?: string | null
    cityCode?: string | null
    countyCode?: string | null
  }>({
    provinceCode: null,
    cityCode: null,
    countyCode: null,
  })

  // 获取用户详细信息
  const getDetailData = async () => {
    if (loading.value) return
    loading.value = true
    try {
      await userStore.getUserInfo()
      const info = userStore.userDetailInfo as userInfoDetailData
      if (userStore.userDetailInfo) {
        // 成功获取
        // 数据回显
        Object.assign(model.value, {
          account: info.account,
          nickname: info.nickname ?? '',
          gender: info.gender ?? genderEnum.undefined,
          birthday: info.birthday ?? '',
          id: info.id ?? 0,
          fullLocation: info.fullLocation ?? '',
          profession: info.profession ?? '',
        })
      }

      // 回显日期选择器
      if (info.birthday) {
        timePick.value = dayjs(info.birthday).valueOf()
      }
    } catch (error) {
      uni.showToast({ icon: 'none', title: '获取个人信息失败' })
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    getDetailData()
  })

  // 确定日期选择器
  const onDateConfirm = ({ value }: { value: string }) => {
    const formatter = dayjs(value).format('YYYY-MM-DD')
    model.value.birthday = formatter
    showDatePicker.value = false
  }

  // 确定地区选择器
  const onAreaConfirm = ({
    selectedOptions,
  }: {
    value: any
    selectedOptions: CascaderOption[]
  }) => {
    // 返回类似 "广东省 广州市 增城区"
    model.value.fullLocation = selectedOptions
      .map((item) => {
        return item.text
      })
      .join(' ')
    // 关闭 级联选择器
    cascaderVisible.value = false

    regionCode.value.provinceCode = (selectedOptions[0]?.value as string) ?? null
    regionCode.value.cityCode = (selectedOptions[1]?.value as string) ?? null
    regionCode.value.countyCode = (selectedOptions[2]?.value as string) ?? null
  }

  // ==================== 自定义表单校验规则 ====================
  const rules: FormSchema = {
    // 校验逻辑
    validate(formModel) {
      const issues: { path: string[]; message: string }[] = []
      // 昵称：必填 + 最大长度
      const nickname = String(formModel?.nickname ?? '').trim()
      if (!nickname) {
        issues.push({ path: ['nickname'], message: '请填写昵称' })
      } else if (nickname.length < 2 || nickname.length > 15) {
        issues.push({ path: ['nickname'], message: '昵称至少2个字符,不能超过15个字符' })
      }

      // 职业：非必填，但限制长度
      const profession = String(formModel?.profession ?? '').trim()
      if (profession.length > 15) {
        issues.push({ path: ['profession'], message: '职业不能超过15个字符' })
      }

      // 出生日期：非必填，但有值时要合法且不能晚于今天
      const birthday = formModel?.birthday
      if (birthday) {
        const d = dayjs(birthday)
        if (!d.isValid()) {
          issues.push({ path: ['birthday'], message: '出生日期格式不正确' })
        } else if (d.isAfter(dayjs(), 'day')) {
          issues.push({ path: ['birthday'], message: '出生日期不能晚于今天' })
        } else if (d.isBefore(dayjs(minDate.value), 'day')) {
          issues.push({ path: ['birthday'], message: '出生日期不能早于2000年' })
        }
      }

      return issues
    },
  }

  // 定时器id
  let timer: ReturnType<typeof setTimeout> | null = null

  // 提交表单 回调函数
  const submit = async () => {
    // 如果表单还没挂载 和正在加载中
    if (!formRef.value || submitLoading.value) return

    try {
      const result = await formRef.value.validate()
      if (!result.valid) {
        return
      }
    } catch (error) {
      return
    }

    try {
      submitLoading.value = true

      const genderVal = model.value.gender === genderEnum.undefined ? null : model.value.gender

      // 校验成功之后 收集请求参数 发送修改请求
      const params: updateUserInfoParams = {
        nickname: model.value.nickname,
        gender: genderVal || null,
        birthday: model.value.birthday || null,
        profession: model.value.profession || null,
        ...regionCode.value,
      }
      await userStore.UpdateUserInfo(params)

      // 定时器还存在 则去掉定时器
      if (timer !== null) {
        clearTimeout(timer)
      }
      uni.showToast({
        icon: 'success',
        title: '保存成功',
      })
      timer = setTimeout(() => {
        uni.navigateBack({ delta: 1 })
        timer = null // 执行完毕后置空
      }, 1200)

      // 重新刷新数据
      // await getDetailData()
    } catch (error) {
      uni.showToast({ icon: 'none', title: '保存失败，请重试' })
    } finally {
      submitLoading.value = false
    }
  }

  onBeforeUnmount(() => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null // 清理后置空
    }
  })
</script>

<style scoped lang="scss"></style>
