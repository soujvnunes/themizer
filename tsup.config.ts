import { defineConfig } from 'tsup'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { validatePlainObject } from './src/cli/validators'

// Read version from package.json with error handling
function getVersion(): string {
  try {
    const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'))

    // Validate structure (must be plain object, not array or null)
    validatePlainObject<{ version: string }>(packageJson)

    return packageJson.version || '0.0.0'
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to read version from package.json: ${errorMessage}`)
  }
}

const version = getVersion()

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
    define: {
      __VERSION__: `"${version}"`,
    },
  },
])
