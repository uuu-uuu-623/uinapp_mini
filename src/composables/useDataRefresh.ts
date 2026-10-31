// 全局 Token 定义 (provide/inject 的key)
import type { InjectionKey } from 'vue'

// 组件提供的 刷新重置数据函数的类型定义
export type RefreshCallBackType = () => void | Promise<void>

// 每个 inject的组件变量 都必须有 register(注册)这个函数 用来调用
// 函数的形参类型必须是 RefreshCallBackType
export interface RefreshContext {
  // register这个函数 主要作用是
  // 子组件对页面说：“刷新页面的时候，也帮我刷一下。”
  register: (fn: RefreshCallBackType) => void
}

// 定义refresh_key
export const Refresh_KEY: InjectionKey<RefreshContext> = Symbol('page-refresh')
