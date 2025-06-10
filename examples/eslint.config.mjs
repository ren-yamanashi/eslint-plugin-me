import me from '@reyn/eslint-plugin-me';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  me.configs.all,
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
