module.exports = {
  semi: true,
  singleQuote: true,
  printWidth: 180,
  trailingComma: 'all',
  arrowFunctionParentheses: 'avoid',
  operatorLinebreak: 'start',
  tabWidth: 2,
  extends: ['plugin:prettier/recommended', 'prettier/flowtype', 'prettier/react', 'prettier/standard'],
  overrides: [
    {
      files: 'package*.json',
      options: {
        printWidth: 1000,
      },
    },
  ],
};
