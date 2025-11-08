/**
 * Core validation utilities used by the themizer library
 * These validators are included in the main bundle
 */

/**
 * Maximum length for CSS identifiers
 * Based on browser CSS custom property name limits
 */
const MAX_CSS_IDENTIFIER_LENGTH = 255

/**
 * CSS identifier regex for custom property names
 * Allows letters, digits, hyphens, and underscores
 * Can start with any of these characters (including digits for numeric keys like "16")
 */
const CSS_IDENTIFIER_REGEX = /^[\w-]+$/

/**
 * Validates if a string is a valid CSS identifier (for custom property names)
 * Accepts numeric strings like "16" since object keys like { 16: 'value' } are valid
 * @param identifier - The string to validate (can be stringified number)
 * @returns true if valid, false otherwise
 */
export function isValidCSSIdentifier(identifier: string | number): boolean {
  // Convert numbers to strings (handles numeric object keys)
  const id = typeof identifier === 'number' ? String(identifier) : identifier

  if (!id || typeof id !== 'string') {
    return false
  }

  // Check length constraint (empty strings already caught by !id check above)
  if (id.length > MAX_CSS_IDENTIFIER_LENGTH) {
    return false
  }

  // Check against regex
  return CSS_IDENTIFIER_REGEX.test(id)
}

/**
 * Validates CSS custom property prefix
 * @param prefix - The prefix to validate
 * @throws Error if prefix is invalid
 */
export function validatePrefix(prefix: string): void {
  if (!prefix) {
    throw new Error('Prefix cannot be empty')
  }

  if (!isValidCSSIdentifier(prefix)) {
    throw new Error(
      `Invalid CSS identifier for prefix: "${prefix}". Can only contain letters, digits, hyphens, and underscores.`,
    )
  }
}

/**
 * Validates an object of token values recursively
 * @param tokens - The tokens object to validate
 * @param path - Current path for error reporting (internal use)
 * @throws Error if any value is invalid
 */
export function validateTokens(tokens: Record<string, unknown>, path = ''): void {
  for (const [key, value] of Object.entries(tokens)) {
    const currentPath = path ? `${path}.${key}` : key

    // Validate key is a valid CSS identifier
    if (!isValidCSSIdentifier(key)) {
      throw new Error(`Invalid token key at "${currentPath}": must be a valid CSS identifier`)
    }

    // Recursively validate nested objects
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      validateTokens(value as Record<string, unknown>, currentPath)
    } else if (Array.isArray(value)) {
      // Validate array values (for responsive tokens)
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          validateTokens(item as Record<string, unknown>, `${currentPath}[${index}]`)
        }
      })
    }
    // Primitive values are generally safe but could be sanitized if needed
  }
}
