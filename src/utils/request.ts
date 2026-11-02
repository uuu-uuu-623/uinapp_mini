/* 
请求:
1.拼接完整地址
2.请求超时时间 设为15s
3.添加小程序端请求头标识
4.添加token请求头标识

响应:
1.响应成功:
  1).提取res.data
  2).添加类型
2.响应失败:
  1).解决网络错误 - 提示切换网络
  2).401错误 - 清理用户信息，跳转到登录页 (token失效)
  3).其他错误 - 根据后端返回的错误信息，提示用户
*/

import { BASE_URL } from '@/config/env'
// 传入信号层类型
import { type SafeAbortSignalType, createAbortError } from './abort'
// 引入用户仓库 得到token
import { useUserStore } from '@/stores/modules/user'
import { storage } from './storage'

// 发送请求的配置项类型定义
interface ReqOption {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
  // 支持传入取消信号
  // - 搜索框联想词、频繁切换的 Tab 数据、下拉刷新/触底加载
  signal?: SafeAbortSignalType //新增
}

interface ResData<T> {
  code: number | string
  msg: string
  result?: T
}

// 与axios内部设计 基本一致
// 请求响应拦截器 -- 主要封装了uni.request 和 统一处理 baseURL、token、状态码、业务 code。
// 这个泛型T 是用于 每个接口返回值中的result
export const request = <T = any>(options: ReqOption): Promise<T> => {
  // 引入开发环境
  const baseURL = BASE_URL

  // 是否为 完整路径 (是否为https开头)
  const isFullUrl = /^https?:\/\//.test(options.url)

  const userstore = useUserStore()

  // 1. 如果传入时信号已经是 aborted 状态，直接拒绝
  if (options.signal?.aborted) {
    return Promise.reject(new Error('请求取消'))
  }

  // 是否要加载
  if (options.showLoading) {
    uni.showLoading({ title: options.loadingText || '加载中...', mask: true })
  }

  return new Promise((resolve: any, reject: any) => {
    let onAbort: (() => void) | undefined

    const requestTask = uni.request({
      url: isFullUrl ? options.url : baseURL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        ...options.header,
        'source-client': 'miniapp',
        // 替换成token
        Authorization: userstore.token,
      },
      timeout: 15000,

      // 响应成功
      success: (res) => {
        // res.statusCode	HTTP 协议层 这次网络请求本身是否成功
        // res.data.code	后端业务层 这次业务操作是否成功

        // http请求失败
        if (res.statusCode !== 200) {
          // uni.showToast({ title: `错误:${res.statusCode}`, icon: 'none' })
          return reject(res) //终止程序
        }
        // http请求成功
        // 解构 每个 api接口 的响应值
        const { code, msg, result } = res.data as ResData<T>

        // 业务:
        if (code === 1 || code === '1' || (Number(code) >= 200 && Number(code) < 300)) {
          resolve(result)
        } else if (code === 401 || code === '401') {
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
          // uni.removeStorageSync('token') // 根据你实际的存储 key 调整
          // 清除所有用户信息
          storage.clear()
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/login/login' })
          }, 1500)
          reject(res.data)
        } else {
          uni.showToast({ title: msg || '请求失败', icon: 'none', mask: true })
          reject(res.data)
        }
      },

      // 响应失败
      fail: (err) => {
        const msg = err?.errMsg || ''
        if (msg.includes('abort')) {
          reject(createAbortError()) // 取消，静默
          return
        }
        if (msg.includes('timeout')) {
          uni.showToast({ title: '请求超时', icon: 'error', mask: true })
          reject(err)
          return
        }
        uni.showToast({ title: '网络错误', icon: 'error', mask: true })
        reject(err)
      },

      complete: () => {
        if (options.showLoading) uni.hideLoading()
        // 4. 请求结束后清理监听器，防止内存泄漏
        if (onAbort && options.signal) {
          options.signal.removeEventListener('abort', onAbort)
        }
      },
    })

    // 5. 注册 abort 监听器：当外部调用 controller.abort() 时，取消本次请求
    if (options.signal) {
      onAbort = () => {
        requestTask.abort()
      }
      options.signal.addEventListener('abort', onAbort)
    }
  })
}
