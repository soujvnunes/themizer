/**
 * CLI-specific validation utilities
 * These are only used by CLI commands and not included in the library bundle
 */

/**
 * Validates that a value is a plain object (not null, array, or primitive).
 * This is a type guard function that can be used in conditionals.
 *
 * @param value - The value to validate
 * @returns true if value is a plain object, false otherwise
 *
 * @example
 * ```ts
 * if (isPlainObject(data)) {
 *   // TypeScript knows data is Record<string, unknown>
 *   const keys = Object.keys(data)
 * }
 * ```
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Validates that a value is a plain object and throws if it's not.
 * This is an assertion function that narrows the type.
 *
 * @param value - The value to validate
 * @throws Error if value is not a plain object
 *
 * @example
 * ```ts
 * const data = JSON.parse(jsonString)
 * validatePlainObject(data) // Throws if not a plain object
 * // TypeScript now knows data is Record<string, unknown>
 * ```
 */
export function validatePlainObject<O extends Record<string, unknown>>(
  value: unknown,
): asserts value is O {
  if (!isPlainObject(value)) {
    throw new Error('Value must be a plain object (not null, array, or primitive)')
  }
}

/**
 * Validates file path to prevent directory traversal
 * Note: This is for CLI user input validation. For a local CLI tool,
 * the user has full filesystem access anyway, so this mainly prevents
 * accidental mistakes rather than malicious attacks.
 *
 * @param filePath - The file path to validate
 * @throws Error if path is suspicious
 */
export function validateFilePath(filePath: string): void {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('File path must be a non-empty string')
  }

  // Check for null bytes (always invalid in paths)
  if (filePath.includes('\0')) {
    throw new Error('File path cannot contain null bytes')
  }

  // For relative paths with "..", check if they're trying to escape too far up
  // Normalize the path to handle cases like "./src/../app" correctly
  if (filePath.includes('..')) {
    const normalized = filePath.replace(/\\/g, '/').split('/')
    let depth = 0
    let minDepth = 0

    for (const segment of normalized) {
      if (segment === '..') {
        depth--
        minDepth = Math.min(minDepth, depth)
      } else if (segment && segment !== '.') {
        depth++
      }
    }

    // If we go more than 3 levels up from start, it's likely a mistake
    if (minDepth < -3) {
      throw new Error(
        'File path cannot traverse more than 3 parent directories (possible directory traversal)',
      )
    }
  }
}
