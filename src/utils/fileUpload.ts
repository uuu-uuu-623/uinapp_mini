// 文件上传拦截器
import { useUserStore } from '@/stores/modules/user'
import { BASE_URL } from '@/config/env'
// 发送请求的配置项类型定义
interface UploadOption {
  url: string
  filePath: string
  name?: string
  formData?: Record<string, any>
  header?: Record<string, string>
}

interface ResData<T> {
  code: number
  msg: string
  result?: T
}

/**
 *
 * - 黑马接口禁用了 不可上传更改图片
 *
 */

export const upload = <T = any>(options: UploadOption): Promise<T> => {
  const baseURL = BASE_URL
  // 是否为 完整路径 (是否为https开头)
  const isFullUrl = /^https?:\/\//.test(options.url)

  const userStore = useUserStore()
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: isFullUrl ? options.url : baseURL + options.url,
      filePath: options.filePath,
      name: options.name || 'file',
      formData: options.formData || {},
      header: {
        ...options.header,
        'source-client': 'miniapp',
        Authorization: userStore.token,
      },
      timeout: 1500,

      success: (res) => {
        if (res.statusCode !== 200) {
          uni.showToast({ title: `上传失败 ${res.statusCode}`, icon: 'none' })
          return reject(res)
        }

        // uploadFile 返回的是字符串，需要解析
        let data: ResData<T>
        try {
          data = JSON.parse(res.data)
        } catch {
          uni.showToast({ title: '响应解析失败', icon: 'none' })
          return reject(res)
        }
        const { code, msg, result } = data
        if (code >= 200 && code < 300) {
          resolve(result as T)
        } else {
          uni.showToast({ title: msg || '上传失败', icon: 'none' })
          reject(data)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      },
    })
  })
}
