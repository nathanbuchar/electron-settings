module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'arrow-body-style': 'off',
    'import/extensions': ['error', 'always', {
      js: 'never',
      ts: 'never',
    }],
    'no-else-return': 'off',
    'no-shadow': 'off',
    'no-use-before-define': ['error', { functions: false }],
    'padded-blocks': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
};
