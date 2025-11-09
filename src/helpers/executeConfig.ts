import { pathToFileURL } from 'node:url'

/**
 * Wrapper for dynamic import to enable mocking in tests
 * @internal
 */
export async function importModule(url: string) {
  return import(url)
}

/**
 * Result from executing the themizer config
 */
export interface ExecuteConfigResult {
  css: string
  variableMap?: { [minified: string]: string }
}

/**
 * Dynamically imports and executes the themizer config file.
 * Returns the generated CSS and optional variable map from the config.
 *
 * @param configPath - Absolute path to the config file
 * @param _importModule - Optional import function for testing
 * @returns Object containing CSS string and optional variableMap
 * @throws Error if the config file cannot be imported or doesn't export a valid theme
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

    // Validate that the config exports a theme with rules.css
    if (!module.default?.rules?.css) {
      throw new Error(
        'Config file must export a theme object with rules.css property. ' +
          'Ensure your config uses: export default themizer(...)',
      )
    }

    // Return CSS and optional variableMap
    return {
      css: module.default.rules.css,
      variableMap: module.default.variableMap,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to execute config file: ${error.message}`)
    }
    throw error
  }
}
