/**
 * Type guard utilities for detecting expansion patterns
 */

import { type UnitsConfig, isCSSUnitType } from './unitTypes'

/**
 * Check if a value is a unit expansion tuple (deprecated format)
 * Unit expansion tuple: ['0px', '4px', '64px'] (all strings matching number+unit pattern)
 * vs Responsive tuple: [{ media: value }, default?] (object + optional value)
 *
 * @deprecated Use isUnitsConfig instead for the new object format
 * @param value The value to check
 * @returns true if the value is a unit expansion tuple
 */
export function isUnitExpansionTuple(value: unknown): value is [string, string, string] {
  if (!Array.isArray(value)) {
    return false
  }

  // Must have exactly 3 elements
  if (value.length !== 3) {
    return false
  }

  // All elements must be strings
  if (!value.every((item) => typeof item === 'string')) {
    return false
  }

  // All elements must match the pattern: number (with optional decimal) + unit
  const pattern = /^[\d.]+[a-z%]+$/
  return value.every((item) => pattern.test(item as string))
}

/**
 * Check if a value is a valid units configuration object
 * Units config: { rem: [0, 0.25, 4], px: [0, 4, 64] }
 *
 * @param value The value to check
 * @returns true if the value is a valid units configuration
 */
export function isUnitsConfig(value: unknown): value is UnitsConfig {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  // Check each entry
  for (const [key, val] of Object.entries(value)) {
    // Key must be a valid CSS unit type
    if (!isCSSUnitType(key)) {
      return false
    }

    // Value must be a tuple of exactly 3 numbers
    if (!Array.isArray(val) || val.length !== 3) {
      return false
    }

    // All elements must be numbers
    if (!val.every((item) => typeof item === 'number')) {
      return false
    }
  }

  return true
}
