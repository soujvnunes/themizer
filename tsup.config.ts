import { defineConfig } from 'tsup'

export default defineConfig([
  {
    dts: true,
    clean: true,
    sourcemap: true,
    splitting: false,
    format: ['cjs', 'esm'],
    entry: ['./src/index.ts'],
  },
  {
    clean: false,
    outDir: './dist/cli',
    format: ['cjs'],
    entry: ['./src/cli/bin.ts'],
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
])
