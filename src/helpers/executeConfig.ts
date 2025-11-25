import { pathToFileURL } from 'node:url'
import { createError } from '../lib/createError'

/**
 * Wrapper for dynamic import to enable mocking in tests
 * @internal
 */
export async function importModule(url: string) {
  return import(url)
}

/**
 * Individual theme export from the config
 */
export interface ThemeExport {
  name: string
  css: string
  variableMap?: { [minified: string]: string }
}

/**
 * Result from executing the themizer config
 */
export interface ExecuteConfigResult {
  themes: ThemeExport[]
  css: string
  variableMap?: { [minified: string]: string }
}

/**
 * Dynamically imports and executes the themizer config file.
 * Returns the generated CSS and optional variable map from all named exports.
 *
 * @param configPath - Absolute path to the config file
 * @param _importModule - Optional import function for testing
 * @returns Object containing themes array, combined CSS string, and merged variableMap
 * @throws Error if the config file cannot be imported or doesn't export valid themes
 */
export default async function executeConfig(
  configPath: string,
  _importModule: typeof importModule = importModule,
): Promise<ExecuteConfigResult> {
  // Convert file path to file:// URL for dynamic import
  // This is necessary for proper module resolution across platforms
  const configUrl = pathToFileURL(configPath).href

  // Add timestamp to bust Node.js module cache
  // This ensures config changes are picked up in watch mode
  const cacheBustedUrl = `${configUrl}?t=${Date.now()}`

  try {
    // Dynamic import executes the config file
    const module = await _importModule(cacheBustedUrl)

    // Collect all valid theme exports (named exports only, skip 'default')
    const themes: ThemeExport[] = []

    for (const [exportName, exportValue] of Object.entries(module)) {
      // Skip default export - only named exports are supported
      if (exportName === 'default') continue

      // Check if this export is a valid theme (has rules.css property)
      const value = exportValue as { rules?: { css?: string }; variableMap?: Record<string, string> }
      if (value?.rules?.css) {
        themes.push({
          name: exportName,
          css: value.rules.css,
          variableMap: value.variableMap,
        })
      }
    }

    // Validate that at least one valid theme was found
    if (themes.length === 0) {
      createError(
        'config',
        'No valid theme exports found. Use named exports: export const theme = themizer(...)',
      )
    }

    // Combine all CSS from themes
    const css = themes.map((t) => t.css).join('\n')

    // Merge all variable maps
    const mergedVariableMap = themes.reduce<Record<string, string>>(
      (acc, t) => ({ ...acc, ...t.variableMap }),
      {},
    )

    return {
      themes,
      css,
      variableMap: Object.keys(mergedVariableMap).length > 0 ? mergedVariableMap : undefined,
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith('themizer [')) throw error

      createError('config', `Failed to execute config file: ${error.message}`)
    }
    throw error
  }
}
