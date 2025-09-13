// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import pluginQuery from '@tanstack/eslint-plugin-query';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  pluginQuery.configs['flat/recommended'],

  [
    {
      ignores: ['postcss.config.cjs', 'src-tauri/**'],
    },
    {
      plugins: {
        react: pluginReact,
        reactHooks: pluginReactHooks,
      }
    },
    {
      rules: {
        "semi": ["error", "always"],
        "semi-spacing": ["error", { "after": true, "before": false }],
        "semi-style": ["error", "last"],
        "no-extra-semi": "error",
        "no-unexpected-multiline": "error",
        "no-unreachable": "error"
      }
    }
  ]
);