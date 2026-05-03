import eslintConfigPrettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'error',
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  }
];