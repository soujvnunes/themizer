import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { isPlainObject } from '../lib/validators'

export type Framework = 'next-app' | 'next-pages' | 'remix' | 'vite' | 'create-react-app' | 'other'

export interface FrameworkDetectionResult {
  framework: Framework
  hasSrcDir: boolean
  suggestedPath: string
}

/**
 * Detects the framework being used in the project by analyzing package.json dependencies
 */
export function detectFramework(): Framework {
  const packageJsonPath = join(process.cwd(), 'package.json')

  if (!existsSync(packageJsonPath)) {
    return 'other'
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

    // Validate structure (must be plain object, not array or null)
    if (!isPlainObject(packageJson)) {
      return 'other'
    }

    // Extract dependencies with proper type checking
    const dependencies = isPlainObject(packageJson.dependencies) ? packageJson.dependencies : {}
    const devDependencies = isPlainObject(packageJson.devDependencies)
      ? packageJson.devDependencies
      : {}

    const allDeps = {
      ...dependencies,
      ...devDependencies,
    }

    // Check for Next.js
    if (allDeps.next) {
      // Try to detect if it's App Router or Pages Router
      // App Router is the default in Next.js 13+
      // Handle case where allDeps.next might be an object (e.g., resolved dependency)
      const nextVersionRaw = typeof allDeps.next === 'string' ? allDeps.next : String(allDeps.next)
      const nextVersion = nextVersionRaw.replace(/[^0-9.]/g, '')
      const versionParts = nextVersion.split('.')
      const majorVersion =
        versionParts.length > 0 && versionParts[0] ? parseInt(versionParts[0], 10) : NaN

      if (!isNaN(majorVersion) && majorVersion >= 13) {
        // Check if app directory exists
        const hasAppDir =
          existsSync(join(process.cwd(), 'app')) || existsSync(join(process.cwd(), 'src/app'))
        return hasAppDir ? 'next-app' : 'next-pages'
      }

      return 'next-pages'
    }

    // Check for Remix
    if (allDeps['@remix-run/react'] || allDeps['@remix-run/node']) {
      return 'remix'
    }

    // Check for Vite
    if (allDeps.vite) {
      return 'vite'
    }

    // Check for Create React App
    if (allDeps['react-scripts']) {
      return 'create-react-app'
    }

    return 'other'
  } catch (error) {
    return 'other'
  }
}

/**
 * Checks if the project has a src/ directory
 */
export function hasSrcDirectory(): boolean {
  return existsSync(join(process.cwd(), 'src'))
}

/**
 * Generates a suggested path for theme.css based on framework and project structure
 */
export function generateSuggestedPath(framework: Framework, hasSrc: boolean): string {
  switch (framework) {
    case 'next-app':
      return hasSrc ? './src/app' : './app'

    case 'next-pages':
      return hasSrc ? './src/styles' : './styles'

    case 'remix':
      return './app/styles'

    case 'vite':
      return hasSrc ? './src' : './public'

    case 'create-react-app':
      return './src'

    case 'other':
    default:
      return hasSrc ? './src/styles' : './styles'
  }
}

/**
 * Gets framework detection result with suggested path
 */
export function getFrameworkInfo(): FrameworkDetectionResult {
  const framework = detectFramework()
  const hasSrcDir = hasSrcDirectory()
  const suggestedPath = generateSuggestedPath(framework, hasSrcDir)

  return {
    framework,
    hasSrcDir,
    suggestedPath,
  }
}

/**
 * Gets a human-readable name for the framework
 */
export function getFrameworkDisplayName(framework: Framework): string {
  switch (framework) {
    case 'next-app':
      return 'Next.js (App Router)'
    case 'next-pages':
      return 'Next.js (Pages Router)'
    case 'remix':
      return 'Remix'
    case 'vite':
      return 'Vite'
    case 'create-react-app':
      return 'Create React App'
    case 'other':
      return 'Other/Generic'
    default:
      return 'Unknown'
  }
}
