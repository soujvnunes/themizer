/**
 * Creates an error with context information.
 *
 * - **Production**: throws Error (build fails)
 * - **Development**: logs error and returns (server keeps running)
 *
 * Note: Return type is `never` for TypeScript to treat call sites as terminal,
 * but in development mode execution continues. This is intentional to avoid
 * killing the dev server on configuration errors.
 *
 * @param context - The context where the error occurred (e.g., 'validation', 'expansion', 'config')
 * @param message - The error message to display
 * @throws Error in production mode
 */
export function createError(context: string, message: string): never {
  const fullMessage = `themizer [${context}]: ${message}`

  if (process.env.NODE_ENV === 'development') {
    console.error(fullMessage)
    return undefined as never
  }

  throw new Error(fullMessage)
}
