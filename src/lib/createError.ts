/**
 * Creates and throws an error with the themizer prefix
 * Provides consistent error messaging across the library
 */

/**
 * Creates and throws an error with the themizer prefix
 * @param message - The error message to display
 * @throws Error with prefixed message
 * @returns Never returns as it always throws
 */
export function createError(message: string): never {
  throw new Error(`themizer: ${message}`)
}

/**
 * Creates and throws an error with context information
 * @param context - The context where the error occurred (e.g., 'validation', 'expansion')
 * @param message - The error message to display
 * @throws Error with prefixed and contextualized message
 * @returns Never returns as it always throws
 */
export function createContextError(context: string, message: string): never {
  throw new Error(`themizer [${context}]: ${message}`)
}
