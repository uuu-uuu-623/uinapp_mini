// 本文件用于解决跨端兼容性问题  封装了一个类H5端的 AbortController api
// 核心作用为 为异步操作提供一个“取消信号” - 当请求的版本号不一致时
// 调用封装的 AbortController 发送取消旧请求的信号

/**
 * 跨端安全的 AbortController
 * - H5 / 现代浏览器：使用原生 AbortController
 * - 小程序 / App：使用轻量级自定义实现
 */

// 导出错误提示  小程序可能没有 DOMException，要兜底
export function createAbortError(message = 'The operation was aborted') {
  if (typeof DOMException !== 'undefined') return new DOMException(message, 'AbortError')
  const err = new Error(message)
  err.name = 'AbortError'
  return err
}

// 封装接口 整理类型 减少错误
interface MyAbortSinger {
  readonly aborted: boolean
  addEventListener(type: 'abort', listener: () => void): void
  removeEventListener(type: 'abort', listener: () => void): void
}

interface MyAbortController {
  readonly signal: MyAbortSinger
  abort(): void
}

// 小程序 或者 app端的 信号发射器
class MiniAbortSinger implements MyAbortSinger {
  // 取消信号
  private _aborted = false
  // 注册的回调函数
  private _listeners: Array<() => void> = []

  // 获取 是否取消请求的信号 true-取消请求
  get aborted() {
    return this._aborted
  }

  // 事件监听 监听abort事件
  addEventListener(type: 'abort', listener: () => void) {
    if (type !== 'abort') return
    // 当监听的是abort 执行下面
    // 如果this._abort是true - 取消请求 把fn 回调函数push进listeners里 - 待执行
    if (this._aborted) {
      // 如果在 listener注册的时候 abort为true -取消了
      // 那就要异步放进 注册的回调函数 _listeners 中
      Promise.resolve().then(listener)
      // 异步注册的listener回调 会在同步程序完成之后再执行 避免执行时机错误
    } else {
      // abort为false 请求未取消
      // push进listeners中 等待调用
      this._listeners.push(listener)
    }
  }

  // 移除监听事件
  removeEventListener(type: 'abort', listener: () => void) {
    if (type !== 'abort') return
    // 获得注册的listener函数引用  在this._listeners中的索引值
    const index = this._listeners.indexOf(listener)
    if (index > -1) this._listeners.splice(index, 1) // 删除
  }

  /** @internal 仅供 MiniAbortController 调用*/
  _triggerMiniAbortSinger() {
    // 已经取消了 就不用执行了
    if (this._aborted) return
    // 改变信号值
    this._aborted = true
    // 复制 _listeners的函数引用 并清空_listeners
    const listeners = this._listeners.slice()
    this._listeners = []
    // 通知所有 注册abort事件
    // 他们的请求都要取消
    listeners.forEach((fn) => fn())
  }
}

class MiniAbortController implements MyAbortController {
  readonly signal = new MiniAbortSinger()
  abort() {
    this.signal._triggerMiniAbortSinger()
  }
}

// 存在 AbortController 则为h5端 用原生api
// 不存在就是 小程序 or app 用封装的 MiniAbortController
export const SafeAbortController =
  typeof AbortController !== 'undefined'
    ? (AbortController as unknown as { new (): MyAbortController })
    : MiniAbortController

// 控制层类型
export type SafeAbortControllerType = MyAbortController
// 信号层类型
export type SafeAbortSignalType = MyAbortSinger
