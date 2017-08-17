// http://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  presets: ['es2015'],

  // 自訂規則
  rules: {
    // import 的時候不用寫 .js 跟 .vue
    'import/extensions': ['error', 'always', {
      js: 'never',
      vue: 'never',
    }],
    // mongoDB的id都是底線開頭
    'no-underscore-dangle': ['off'],
    'no-param-reassign': ["error", { "props": false }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'camelcase': 'off',
    
    // 我偏偏就是要動態require
    'global-require': 'off',
    'import/no-dynamic-require': 'off'
  },

  'globals': {
  }
};