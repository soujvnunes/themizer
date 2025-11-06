/**
 * Validation utilities for CSS identifiers, values, and media queries
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

  // Check length constraints
  if (id.length === 0 || id.length > MAX_CSS_IDENTIFIER_LENGTH) {
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
 * Sanitizes CSS values to prevent injection attacks
 * @param value - The CSS value to sanitize
 * @returns Sanitized value
 */
export function sanitizeCSSValue(value: string | number): string {
  if (typeof value === 'number') {
    return String(value)
  }

  if (typeof value !== 'string') {
    return String(value)
  }

  // Remove potentially dangerous characters
  // Allow: alphanumeric, spaces, common CSS units, colors, calc(), var()
  const sanitized = value
    .replace(/[<>{}]/g, '') // Remove brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()

  return sanitized
}

/**
 * Validates media query syntax
 * @param query - The media query string (without @media prefix)
 * @returns true if valid, false otherwise
 */
export function isValidMediaQuery(query: string): boolean {
  if (!query || typeof query !== 'string') {
    return false
  }

  const trimmed = query.trim()

  // Must contain at least one feature query in parentheses or be a media type
  // Valid: (min-width: 768px), screen and (max-width: 1024px), print
  const hasFeatureQuery = /\([\w-]+:\s*[\w\s%.-]+\)/.test(trimmed)
  const isMediaType = /^(all|screen|print|speech)(\s+(and|or|not)\s+)?/i.test(trimmed)

  if (!hasFeatureQuery && !isMediaType) {
    return false
  }

  // Check for valid structure
  const validPattern =
    /^(all|screen|print|speech)?(\s+(and|or|not)\s+)?\([\w-]+:\s*[\w\s%.-]+\)(\s+(and|or|not)\s+\([\w-]+:\s*[\w\s%.-]+\))*$/i

  return validPattern.test(trimmed) || isMediaType
}

/**
 * Validates and sanitizes a media query
 * @param query - The media query to validate
 * @throws Error if query is invalid
 */
export function validateMediaQuery(query: string): void {
  if (!query) {
    throw new Error('Media query cannot be empty')
  }

  if (!isValidMediaQuery(query)) {
    throw new Error(
      `Invalid media query syntax: "${query}". Expected format like "(min-width: 768px)" or "screen and (max-width: 1024px)"`,
    )
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
