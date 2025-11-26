/**
 * Creates and throws an error with context information.
 *
 * @param context - The context where the error occurred (e.g., 'validation', 'expansion', 'config')
 * @param message - The error message to display
 * @throws Error with prefixed and contextualized message
 */
export function createError(context: string, message: string): never {
  throw new Error(`themizer [${context}]: ${message}`)
}
