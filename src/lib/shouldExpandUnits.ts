/**
 * Helper to check if a units value should be auto-expanded
 */

import { isUnitsConfig } from './typeGuards'
import type { UnitsConfig } from './unitTypes'

/**
 * Determines if a value should be expanded to a unit sequence
 * @param value The value to check
 * @param key The property key
 * @returns true if the key is 'units' and value is a valid units config object
 */
export function shouldExpandUnits(value: unknown, key: string | number): value is UnitsConfig {
  return key === 'units' && isUnitsConfig(value)
}
