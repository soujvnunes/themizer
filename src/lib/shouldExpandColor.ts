/**
 * Helper to check if a color value should be auto-expanded
 */

import PATH_UNIFIER from '../consts/PATH_UNIFIER'

/**
 * Determines if a value should be expanded to color shades
 * @param value The value to check
 * @param contextPath The current path in the token structure
 * @returns true if the value is an oklch color string inside the colors property
 */
export function shouldExpandColor(value: unknown, contextPath: string): value is string {
  // Must be inside the 'colors' property
  const isInColorsContext = contextPath.endsWith(`colors${PATH_UNIFIER}`)
  if (!isInColorsContext) {
    return false
  }

  // Must be a string matching oklch format
  if (typeof value !== 'string') {
    return false
  }

  return /^oklch\s*\([^)]+\)/.test(value)
}
