// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: { projectService: true }
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase'
        }
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case'
        }
      ],
      // e.g. const x: Set<string> = new Set<any>(); is not allowed 🚫
      '@typescript-eslint/no-unsafe-assignment': 'error',
      /* Using an any to access a member is unsafe
           e.g. const arr = [1, 2, 3];
                arr[var]; // Here var has any type which is unsafe.
      */
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      // e.g boolean expression should be handled for null/undefined cases
      // '@typescript-eslint/strict-boolean-expressions': 'warn',
      // All Angular components must have Change Detection set to OnPush
      '@angular-eslint/prefer-on-push-component-change-detection': 'error'
    }
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {}
  }
);
