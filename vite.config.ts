import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import AutoImport from 'unplugin-auto-import/vite'
import Components from '@uni-helper/vite-plugin-uni-components'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    extensions: ['.ts', '.vue', '.json'],
    alias: {
      // ✅ 使用 fileURLToPath 比 path.resolve('./src') 更严谨，避免 CWD 变更导致路径失效
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    uni(), // 必须首位

    // 自动导入 Vue, Pinia, UniApp API
    AutoImport({
      imports: ['vue', 'pinia', 'uni-app'],
      // ✅ 统一放到 src 目录下，便于 tsconfig 管理
      dts: 'src/auto-imports.d.ts',
    }),

    Components({
      dirs: ['src/components'],
      dts: 'src/components.d.ts',
      // vk 系列 SKU 组件已改为显式 import 引入，排除插件扫描避免其把 .js 打成散块导致小程序 require 不到
      exclude: [/vk-data-/],
    }),

    // SVG 图标插件
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]',
    }),
  ],

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        // 注入全局 SCSS 变量
        additionalData: `@use "@/styles/variables.scss" as *;`,
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },

  build: {
    // ⚠️ 注意：使用 terser 需要额外安装依赖 `npm i terser -D`
    // 如果不想安装，可将 minify 改为 'esbuild'，Vite 默认使用 esbuild，速度更快
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除 console 和 debugger
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
