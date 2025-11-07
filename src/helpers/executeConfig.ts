import { pathToFileURL } from 'node:url'

/**
 * Dynamically imports and executes the themizer config file.
 * This triggers the themizer() call which writes to the temp file.
 *
 * @param configPath - Absolute path to the config file
 * @throws Error if the config file cannot be imported
 */
export default async function executeConfig(configPath: string): Promise<void> {
  // Convert file path to file:// URL for dynamic import
  // This is necessary for proper module resolution across platforms
  const configUrl = pathToFileURL(configPath).href

  // Add timestamp to bust Node.js module cache
  // This ensures config changes are picked up in watch mode
  const cacheBustedUrl = `${configUrl}?t=${Date.now()}`

  try {
    // Dynamic import executes the config file, triggering themizer()
    await import(cacheBustedUrl)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to execute config file: ${error.message}`)
    }
    throw error
  }
}
