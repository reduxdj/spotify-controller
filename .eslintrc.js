const path = require('path');

module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb-base', 'eslint:recommended'],
  env: {
    browser: true,
    node: true,
  },
  plugins: ['react', 'import', 'mocha', 'prettier'],
  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
    flowtype: {
      onlyFilesWithFlowAnnotation: true,
    },
  },
  parser: 'babel-eslint',
  rules: {
    // quotes: ['error', 'single'],
    'no-use-before-define': ['error', { functions: true, classes: true }],
    'max-len': ['warn', { code: 180 }],
    'implicit-arrow-linebreak': 0,
    'object-curly-newline': ['warn', { consistent: true }],
    'jsx-a11y/anchor-is-valid': 0,
    'import/no-extraneous-dependencies': 0,
    'react/no-multi-comp': 0,
    'import/no-duplicates': 1,
    'no-duplicate-imports': 0,
    'prettier/prettier': 0,
    'comma-dangle': 1,
    'arrow-parens': 0,
    'no-unexpected-multiline': 0,
    'no-confusing-arrow': ['error', { allowParens: true }],
    'operator-linebreak': [0, 'start'],
    'react/jsx-pascal-case': 0,
    semi: ['error', 'always'],
    'class-methods-use-this': [
      'error',
      {
        exceptMethods: ['render'],
      },
    ],
    allowForLoopAfterThoughts: 0,
    'import/no-cycle': ['warn'],
  },
  settings: {
    polyfills: ['promises'],
    'import/resolver': {
      node: {
        paths: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, '/')],
      },
    },
  },
};
