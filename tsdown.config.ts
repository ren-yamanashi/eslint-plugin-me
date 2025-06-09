import { defineConfig } from 'tsdown/config';

export default [
  defineConfig({
    entry: 'src/index.ts',
    outDir: 'dist',
    clean: true,
    format: ['esm', 'cjs'],
    dts: true,
  }),
  defineConfig({
    entry: 'src/ts-server-plugin/index.ts',
    outDir: 'dist/ts-server-plugin',
    clean: true,
    format: ['esm', 'cjs'],
    dts: true,
  }),
];
