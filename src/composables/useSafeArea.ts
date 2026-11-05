// 本文件用于 给页面onLoad时 获取设备的底部安全区域

export const useSafeArea = () => {
  const getsafeArea = () => {
    const sysInfo = uni.getSystemInfoSync()
    return sysInfo.safeAreaInsets?.bottom || 0
  }

  return { getsafeArea }
}
