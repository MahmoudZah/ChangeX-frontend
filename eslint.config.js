// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'core', pattern: 'src/app/core/*' },
        { type: 'shared', pattern: 'src/app/shared/*' },
        { type: 'data-access', pattern: 'src/app/features/*/data-access/*' },
        { type: 'feature', pattern: 'src/app/features/*/feature-*/*' },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'feature', allow: ['core', 'shared', 'data-access'] },
            { from: 'data-access', allow: ['core', 'shared', 'data-access'] },
            { from: 'shared', allow: ['shared'] },
            { from: 'core', allow: ['shared'] },
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.angular/**'],
  }
);
