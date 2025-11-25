/**
 * Creates an error with context information
 * Environment-aware: logs in development (server keeps running), throws in production (build fails)
 *
 * @param context - The context where the error occurred (e.g., 'validation', 'expansion', 'config')
 * @param message - The error message to display
 * @throws Error in production mode
 */
export function createError(context: string, message: string): never {
  const fullMessage = `themizer [${context}]: ${message}`

  if (process.env.NODE_ENV === 'development') return console.error(fullMessage) as unknown as never

  throw new Error(fullMessage)
}
