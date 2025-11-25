import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { isPlainObject } from './validators'

export type Framework = 'next-app' | 'next-pages' | 'remix' | 'vite' | 'create-react-app' | 'other'

export interface FrameworkDetectionResult {
  framework: Framework
  hasSrcDir: boolean
  suggestedPath: string
}

/**
 * Extracts and merges all dependencies from package.json
 */
function extractDependencies(packageJson: Record<string, unknown>): Record<string, unknown> {
  const dependencies = isPlainObject(packageJson.dependencies) ? packageJson.dependencies : {}
  const devDependencies = isPlainObject(packageJson.devDependencies) ? packageJson.devDependencies : {}

  return { ...dependencies, ...devDependencies }
}

/**
 * Detects which Next.js router type is being used (App Router vs Pages Router)
 */
function detectNextJsRouterType(nextVersionValue: unknown): Framework {
  const nextVersionRaw =
    typeof nextVersionValue === 'string' ? nextVersionValue : String(nextVersionValue)
  const nextVersion = nextVersionRaw.replace(/[^0-9.]/g, '')
  const versionParts = nextVersion.split('.')
  const majorVersion = versionParts.length > 0 && versionParts[0] ? parseInt(versionParts[0], 10) : NaN

  if (!isNaN(majorVersion) && majorVersion >= 13) {
    const hasAppDir =
      existsSync(join(process.cwd(), 'app')) || existsSync(join(process.cwd(), 'src/app'))
    return hasAppDir ? 'next-app' : 'next-pages'
  }

  return 'next-pages'
}

/**
 * Detects the framework from the merged dependencies object
 */
function detectFrameworkFromDeps(allDeps: Record<string, unknown>): Framework {
  if (allDeps.next) {
    return detectNextJsRouterType(allDeps.next)
  }

  if (allDeps['@remix-run/react'] || allDeps['@remix-run/node']) {
    return 'remix'
  }

  if (allDeps.vite) {
    return 'vite'
  }

  if (allDeps['react-scripts']) {
    return 'create-react-app'
  }

  return 'other'
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

    if (!isPlainObject(packageJson)) {
      return 'other'
    }

    const allDeps = extractDependencies(packageJson)
    return detectFrameworkFromDeps(allDeps)
  } catch {
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
