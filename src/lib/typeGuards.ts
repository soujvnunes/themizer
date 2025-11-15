/**
 * Type guard utilities for detecting expansion patterns
 */

import { type UnitsConfig, isCSSUnitType } from './unitTypes'
import OKLCH_PATTERN from '../consts/OKLCH_PATTERN'

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

    // All elements must be finite numbers
    if (!val.every((item) => typeof item === 'number' && Number.isFinite(item))) {
      return false
    }
  }

  return true
}

/**
 * Check if a value is a valid palette configuration object
 * Palette config: { amber: 'oklch(76.9% 0.188 70.08)' }
 *
 * @param value The value to check
 * @returns true if the value is a valid palette configuration
 */
export function isPaletteConfig(value: unknown): value is Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  // Check each entry
  for (const val of Object.values(value)) {
    // Value must be a string
    if (typeof val !== 'string') {
      return false
    }

    // Value must match OKLCH pattern
    if (!OKLCH_PATTERN.test(val)) {
      return false
    }
  }

  return true
}
