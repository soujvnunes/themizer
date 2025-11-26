import { pathToFileURL } from 'node:url'
import { createError } from '../lib/createError'
import INTERNAL from '../consts/INTERNAL'

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

    // Sort entries alphabetically for deterministic output order.
    // This means themes are combined in alphabetical order, not declaration order.
    const sortedEntries = Object.entries(module).sort(([a], [b]) => a.localeCompare(b))

    for (const [exportName, exportValue] of sortedEntries) {
      // Skip default export - only named exports are supported
      if (exportName === 'default') continue

      // Skip non-object exports
      if (typeof exportValue !== 'object' || exportValue === null) continue

      // Check if this export is a valid theme (has internal rules.css property)
      const value = exportValue as {
        [INTERNAL]?: { rules?: { css?: string }; variableMap?: Record<string, string> }
      }
      const internal = value[INTERNAL]
      if (internal?.rules?.css) {
        themes.push({
          name: exportName,
          css: internal.rules.css,
          variableMap: internal.variableMap,
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
    const mergedVariableMap = themes.reduce<Record<string, string>>((acc, t) => {
      if (t.variableMap) {
        for (const [minified, source] of Object.entries(t.variableMap)) {
          if (minified in acc) {
            console.warn(
              `Variable map collision detected for minified variable "${minified}" between themes. ` +
                `Previous value: "${acc[minified]}", new value: "${source}" from theme "${t.name}".`,
            )
          }
          acc[minified] = source
        }
      }
      return acc
    }, {})

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
