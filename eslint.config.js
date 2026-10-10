import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.mjs', 'api/**/*.mjs', 'scripts/**/*.mjs', 'vite.config.mjs'],
    languageOptions: {
      globals: {
        document: 'readonly', window: 'readonly', HTMLElement: 'readonly',
        HTMLInputElement: 'readonly', HTMLSelectElement: 'readonly', HTMLDialogElement: 'readonly',
        HTMLFormElement: 'readonly', FormData: 'readonly', Blob: 'readonly', URL: 'readonly',
        IntersectionObserver: 'readonly', requestAnimationFrame: 'readonly', setTimeout: 'readonly',
        console: 'readonly', process: 'readonly', Buffer: 'readonly', fetch: 'readonly',
        Response: 'readonly', Request: 'readonly', URLSearchParams: 'readonly', AbortSignal: 'readonly',
        AbortController: 'readonly', clearTimeout: 'readonly', structuredClone: 'readonly',
      },
    },
  },
);
