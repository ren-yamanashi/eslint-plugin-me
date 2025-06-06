import { defineConfig } from 'tsdown/config';

export default [
  defineConfig({
    entry: 'src/index.ts',
    outDir: 'dist/cjs',
    clean: true,
    format: 'cjs',
    dts: true,
    outputOptions: { exports: 'named' },
  }),
  defineConfig({
    entry: 'src/index.ts',
    outDir: 'dist/esm',
    clean: true,
    format: 'esm',
    dts: true,
    outputOptions: { exports: 'named' },
  }),
];
