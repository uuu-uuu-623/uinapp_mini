// 封装统一的 Storage 工具
/**
 * 统一管理 key 前缀，避免冲突
 * 可以加过期时间、JSON 序列化/反序列化
 * 换存储方案时只改一处
 */

const Storage_PreKey = 'Xtx_'

export const storage = {
  // 保存本地存储
  set(key: string, value: any): void {
    try {
      const data = JSON.stringify(value)
      uni.setStorageSync(Storage_PreKey + key, data)
    } catch (e) {
      console.error(`storage.set error [${key}]:`, e)
    }
  },

  // 获取本地存储
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    try {
      const data = uni.getStorageSync(Storage_PreKey + key)
      if (data) {
        return JSON.parse(data) as T
      }
      return defaultValue
    } catch (e) {
      console.error(`storage.get error [${key}]:`, e)
      return defaultValue
    }
  },

  /** 移除存储 */
  remove(key: string): void {
    uni.removeStorageSync(Storage_PreKey + key)
  },

  /** 清空所有带前缀的存储 */
  clear(): void {
    try {
      const res = uni.getStorageInfoSync()

      res.keys.forEach((key) => {
        if (key.startsWith(Storage_PreKey)) {
          uni.removeStorageSync(key)
        }
      })
    } catch (e) {
      console.error('storage.clear error:', e)
    }
  },
}
