import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: 'src/index.ts',
  outDir: 'dist',
  clean: true,
  format: 'esm',
  dts: true,
});
