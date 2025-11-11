/**
 * Unit expansion utilities
 * Expands units configuration into sequences of numeric values
 */

import { type UnitsConfig, type ExpandedUnits, unitSuffixes } from './unitTypes'

// Multiplier for rounding to 10 decimal places to avoid floating-point accumulation errors
const PRECISION_MULTIPLIER = 1e10

/**
 * Expand a single unit tuple into a sequence
 * @param tuple [from, step, to] numeric values
 * @param unit The unit suffix to append
 * @returns Object with numeric keys and formatted string values
 */
function expandUnitTuple(tuple: [number, number, number], unit: string): Record<number, string> {
  const [from, step, to] = tuple

  // Validate step is positive
  if (step <= 0) {
    throw new Error(`Step must be positive, got ${step}`)
  }

  // Validate from <= to
  if (from > to) {
    throw new Error(`From (${from}) must be less than or equal to To (${to})`)
  }

  const result: Record<number, string> = {}

  // Generate sequence using integer-based iteration to avoid floating-point accumulation
  const numSteps = Math.round((to - from) / step)
  for (let i = 0; i <= numSteps; i++) {
    const value = from + (i * step)
    // Round to avoid floating point precision issues
    const key = Math.round(value * PRECISION_MULTIPLIER) / PRECISION_MULTIPLIER
    result[key] = `${key}${unit}`
  }

  return result
}

/**
 * Expand a units configuration object into sequences
 * @param config Units configuration object with unit types as keys
 * @returns Object with unit types as keys and expanded sequences as values
 *
 * @example
 * expandUnits({ rem: [0, 0.25, 4], px: [0, 4, 64] })
 * // Returns: {
 * //   rem: { 0: '0rem', 0.25: '0.25rem', 0.5: '0.5rem', ..., 4: '4rem' },
 * //   px: { 0: '0px', 4: '4px', 8: '8px', ..., 64: '64px' }
 * // }
 *
 * @example
 * expandUnits({ percentage: [0, 25, 100], vh: [0, 50, 100] })
 * // Returns: {
 * //   percentage: { 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' },
 * //   vh: { 0: '0vh', 50: '50vh', 100: '100vh' }
 * // }
 */
export function expandUnits<T extends UnitsConfig>(config: T): ExpandedUnits<T> {
  const result = {} as ExpandedUnits<T>

  for (const [unitType, tuple] of Object.entries(config) as Array<
    [keyof T, [number, number, number]]
  >) {
    // Get the CSS suffix for this unit type
    const suffix = unitSuffixes[unitType as keyof typeof unitSuffixes]
    if (!suffix) {
      throw new Error(`Unknown unit type: ${String(unitType)}`)
    }

    // Expand the tuple for this unit type
    result[unitType] = expandUnitTuple(tuple, suffix) as ExpandedUnits<T>[keyof T]
  }

  return result
}
