export default {
  // 第三方组件含 uni-app 条件编译/特殊写法，交由 uni-app 自身编译器处理，跳过 stylelint
  ignoreFiles: ['**/vk-data-goods-sku-popup/**', 'node_modules/**', 'dist/**', 'unpackage/**'],
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recommended-vue/scss'],
  plugins: ['stylelint-order'],
  overrides: [
    {
      files: ['**/*.scss', '**/*.css'],
      customSyntax: 'postcss-scss',
    },
    {
      files: ['**/*.vue', '**/*.html'],
      customSyntax: 'postcss-html',
    },
  ],
  rules: {
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global', 'deep'] }],
    'selector-type-no-unknown': [
      true,
      { ignoreTypes: ['page', 'radio', 'checkbox', 'scroll-view'] },
    ],
    'no-descending-specificity': null,
    // uni-app / 小程序 使用 rpx、upx 等单位，标准 stylelint 不认识，需放行
    'unit-no-unknown': [true, { ignoreUnits: ['rpx', 'upx'] }],
    // wot-ui 等组件库使用 BEM（__/--）及驼峰类名，关闭强约束
    'selector-class-pattern': null,
    // 动画名允许驼峰写法（如 showPopup / hideLayer）
    'keyframes-name-pattern': null,
  },
}
