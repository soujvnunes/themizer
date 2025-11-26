/**
 * Core validation utilities used by the themizer library
 * These validators are included in the main bundle
 */

import OKLCH_PATTERN from '../consts/OKLCH_PATTERN'
import MAX_CSS_IDENTIFIER_LENGTH from '../consts/MAX_CSS_IDENTIFIER_LENGTH'
import CSS_IDENTIFIER_REGEX from '../consts/CSS_IDENTIFIER_REGEX'
import { createError } from './createError'

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
    return createError('validation', 'Prefix cannot be empty')
  }

  if (!isValidCSSIdentifier(prefix)) {
    return createError(
      'validation',
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
      createError('validation', `Invalid token key at "${currentPath}": must be a valid CSS identifier`)
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
  }
}

/**
 * Validates units configuration contains only valid CSS unit types
 * @param value - The value to validate
 * @param path - Path for error reporting
 * @throws Error if configuration contains invalid keys
 */
export function validateUnitsConfig(value: unknown, path = 'units'): void {
  if (value === undefined) {
    return
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return createError(
      'validation',
      `Invalid units configuration at "${path}": must be an object with CSS unit types as keys`,
    )
  }

  const validUnits = ['rem', 'em', 'px', 'percentage', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'ex']

  for (const key of Object.keys(value)) {
    if (!validUnits.includes(key)) {
      createError(
        'validation',
        `Invalid units key "${key}" at "${path}". ` +
          `Units can only contain CSS unit types: ${validUnits.join(', ')}. ` +
          `Custom named values like "spacing" should be defined as separate token properties, not nested in units.`,
      )
      continue
    }

    const val = (value as Record<string, unknown>)[key]
    if (!Array.isArray(val) || val.length !== 3) {
      createError(
        'validation',
        `Invalid value for units.${key}: expected [from, step, to] tuple with 3 numbers`,
      )
      continue
    }

    if (!val.every((item) => typeof item === 'number' && Number.isFinite(item))) {
      createError('validation', `Invalid value for units.${key}: all elements must be finite numbers`)
    }
  }
}

/**
 * Validates palette configuration contains only valid OKLCH color strings
 * @param value - The value to validate
 * @param path - Path for error reporting
 * @throws Error if configuration contains non-OKLCH strings or nested objects
 */
export function validatePaletteConfig(value: unknown, path = 'palette'): void {
  if (value === undefined) {
    return
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return createError(
      'validation',
      `Invalid palette configuration at "${path}": must be an object with color names as keys and OKLCH strings as values`,
    )
  }

  for (const [key, val] of Object.entries(value)) {
    const currentPath = `${path}.${key}`

    // Check that value is a string
    if (typeof val !== 'string') {
      createError(
        'validation',
        `Invalid palette value at "${currentPath}": expected OKLCH color string, got ${typeof val}`,
      )
      continue
    }

    // Check that value matches OKLCH pattern
    if (!OKLCH_PATTERN.test(val)) {
      createError(
        'validation',
        `Invalid palette value at "${currentPath}": "${val}" is not a valid OKLCH color. ` +
          `Expected format: "oklch(L% C H)" where L is lightness (0-100%), C is chroma (0+), and H is hue (0-360)`,
      )
    }
  }
}
