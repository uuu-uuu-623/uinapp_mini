import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettierConfig from 'eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier'

// 全局变量：browser + node + uni-app/小程序，避免 no-undef 误报
const appGlobals = {
  // browser
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  location: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  // node（构建脚本/preinstall）
  process: 'readonly',
  // uni-app / 小程序
  uni: 'readonly',
  wx: 'readonly',
  getApp: 'readonly',
  getCurrentPages: 'readonly',
  Page: 'readonly',
  Component: 'readonly',
  App: 'readonly',
  Plus: 'readonly',
  plus: 'readonly',
  UniApp: 'readonly',
  __wxConfig: 'readonly',
}

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'unpackage',
      '.husky',
      '*.d.ts',
      'src/components/vk-data-goods-sku-popup/**',
    ],
  },
  { languageOptions: { globals: appGlobals } },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...pluginVue.configs['flat/strongly-recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },
  prettierConfig,
  {
    plugins: { prettier: pluginPrettier },
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'vue/no-reserved-component-names': 'off',
    },
  },
)
