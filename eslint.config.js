import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'design-tokens/generated', 'tools', 'coverage'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-irregular-whitespace': [
        'error',
        { skipStrings: true, skipTemplates: true, skipJSXText: true },
      ],
      // New, opinionated React-compiler-era rules: surface them, but do not block an
      // existing, working app on patterns that are legitimate here.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      // Accessibility: kept visible as warnings to burn down over time rather than
      // block the build on a gesture-driven personal app. A dedicated a11y pass on the
      // lightboxes and the day sheet is a tracked follow-up.
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      // Personal one-to-one video messages ship without a caption track by design.
      'jsx-a11y/media-has-caption': 'off',
    },
  },
)
