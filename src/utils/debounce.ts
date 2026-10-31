// utils/debounce.ts
// 防抖
export function debounce<T extends (...args: any[]) => any>(fn: T, delay = 300, immediate = false) {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)

    if (immediate) {
      // 立即执行版：第一次点击马上执行，delay 内不再触发
      const callNow = !timer
      timer = setTimeout(() => {
        timer = null
      }, delay)
      if (callNow) fn.apply(this, args)
    } else {
      // 延迟执行版：最后一次点击后 delay 毫秒才执行
      timer = setTimeout(() => {
        timer = null
        fn.apply(this, args)
      }, delay)
    }
  }

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return debounced
}
