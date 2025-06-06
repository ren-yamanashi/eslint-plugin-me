import plugin from 'eslint-plugin-type-implements-interface';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  plugin.configs.all,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    ignores: ['eslint.config.mjs', '*.d.ts', 'node_modules'],
  },
];
