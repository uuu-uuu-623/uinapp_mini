// 组合式函数 - 页面下拉刷新时 主页及主页的子组件 重置数据
import { onUnmounted, onMounted, provide } from 'vue'
import { type RefreshCallBackType, Refresh_KEY } from '@/composables/useDataRefresh'

// 重点: 用于管理需要刷新数据的组件函数回调 - 因为组件中会传入刷新数据的函数进来
// 模块级全局变量，生命周期贯穿整个应用
const listeners = new Set<RefreshCallBackType>()

// 子组件调用  (调用的)
// - 挂载时传入刷新数据的函数
// - 销毁时把这个子组件的 刷新数据的函数去掉
// 不成功销毁的话 组件传进来的函数的话 会造成内存泄漏
export const useDataRefresh = (onRefreshFn: RefreshCallBackType) => {
  onMounted(() => listeners.add(onRefreshFn))
  onUnmounted(() => listeners.delete(onRefreshFn))
}

// 父组件调用 - 触发所有已注册的刷新回调
export const triggerHomeRefresh = async () => {
  // Promise.all() -- 要数组里有一个 Promise 被 reject（报错），整个 Promise.all 就会立即报错，
  // 剩下的 Promise 虽然可能还在跑，但你拿不到它们的结果了。

  // Promise.allSettled() -- 它会等待所有 Promise 结束（不管成功还是失败），
  // 最后返回一个数组，告诉你每个任务的状态（fulfilled 或 rejected）和结果。
  await Promise.allSettled([...listeners].map((fn) => fn()))
}

// 父组件调用 给全局复用组件调用
export const provideHomeRefresh = () => {
  provide(Refresh_KEY, {
    register: (fn) => {
      // 形参fn类型 也是 RefreshCallBackType （组件提供的 刷新重置数据函数的类型）
      onMounted(() => listeners.add(fn))
      onUnmounted(() => listeners.delete(fn))
    },
  })
}
