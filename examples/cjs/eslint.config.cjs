const plugin = require('eslint-plugin-type-implements-interface');
const tseslint = require('typescript-eslint');

module.exports = [
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
    ignores: ['eslint.config.cjs', '*.d.ts', 'node_modules'],
  },
];
