import { createSSRApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
import '@/styles/index.scss'

export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)

  // 兼容 vk-data-goods-sku-popup 等 Vue2 组件对 this.$set 的依赖（Vue3 已移除 $set）
  app.config.globalProperties.$set = (obj: any, key: any, val: any) => {
    if (obj && typeof obj === 'object') obj[key] = val
  }
  app.config.globalProperties.$delete = (obj: any, key: any) => {
    if (obj && typeof obj === 'object') delete obj[key]
  }
  return {
    app,
  }
}
