import { pathToFileURL } from 'node:url'

/**
 * Dynamically imports and executes the themizer config file.
 * Returns the generated CSS from the config.
 *
 * @param configPath - Absolute path to the config file
 * @returns The generated CSS string from the config
 * @throws Error if the config file cannot be imported or doesn't export a valid theme
 */
export default async function executeConfig(configPath: string): Promise<string> {
  // Convert file path to file:// URL for dynamic import
  // This is necessary for proper module resolution across platforms
  const configUrl = pathToFileURL(configPath).href

  // Add timestamp to bust Node.js module cache
  // This ensures config changes are picked up in watch mode
  const cacheBustedUrl = `${configUrl}?t=${Date.now()}`

  try {
    // Dynamic import executes the config file
    const module = await import(cacheBustedUrl)

    // Validate that the config exports a theme with rules.css
    if (!module.default?.rules?.css) {
      throw new Error(
        'Config file must export a theme object with rules.css property. ' +
          'Ensure your config uses: export default themizer(...)',
      )
    }

    // Return CSS directly
    return module.default.rules.css
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to execute config file: ${error.message}`)
    }
    throw error
  }
}
