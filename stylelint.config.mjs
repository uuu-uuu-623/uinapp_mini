export default {
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
  },
}
