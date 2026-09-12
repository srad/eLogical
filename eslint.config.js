import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import pluginTypeScript from '@typescript-eslint/eslint-plugin';
import parserTypeScript from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

const unusedVars = ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }];

export default [
  {
    // `android/app/src/main/assets/public` holds the built web bundle, `dist/` the
    // build output — neither is source.
    ignores: ['node_modules/', 'dist/', 'android/', 'stats.html'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: parserTypeScript,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript,
    },
    rules: {
      ...pluginTypeScript.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': unusedVars,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  // Sets up vue-eslint-parser for .vue files; this is an array of configs, not a rules bag.
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: parserTypeScript,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': unusedVars,
      // A component imported as `Stopwatch` but used as <stopwatch> reads as an unused
      // import, and deleting it leaves the tag unresolved — it renders as a bare DOM
      // element, so a `ref` on it yields an Element and any method call on that ref
      // throws at runtime. This rule flags the tag, so the two findings can't disagree.
      'vue/no-undef-components': [
        'error',
        // Registered globally in src/main.ts, so it never appears as a local import.
        { ignorePatterns: ['font-awesome-icon', 'FontAwesomeIcon', 'router-link', 'router-view', 'RouterLink', 'RouterView'] },
      ],
    },
  },
  {
    files: ['**/*.{js,ts,vue}'],
    rules: {
      'no-prototype-builtins': 'warn',
    },
  },
  // Must stay last: switches off every rule Prettier already handles (`semi` included).
  prettier,
];
