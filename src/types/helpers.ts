/**
 * Type helper utilities for improved type inference and developer experience
 */

import type { UnitsConfig, ExpandedUnits } from '../lib/unitTypes'
import type { ColorShades } from '../lib/expandColor'

/**
 * Extract the available keys from an expanded units configuration.
 * Useful for type-safe access to unit values.
 *
 * @example
 * type MyUnits = ExtractUnitKeys<{ rem: [0, 0.25, 4] }>
 * // MyUnits['rem'] will have keys: 0 | 0.25 | 0.5 | ... | 4
 */
export type ExtractUnitKeys<T extends UnitsConfig> = {
  [K in keyof ExpandedUnits<T>]: keyof ExpandedUnits<T>[K]
}

/**
 * Branded type for strict unit checking.
 * Ensures that only valid unit keys can be used.
 *
 * @example
 * const spacing: StrictUnits<{ rem: [0, 0.25, 4] }> = {
 *   rem: { 0: '0rem', 0.25: '0.25rem', ... }
 * }
 */
export type StrictUnits<T extends UnitsConfig> = ExpandedUnits<T> & {
  readonly _brand: 'StrictUnits'
}

/**
 * Extract palette color names from a palette configuration
 *
 * @example
 * type MyPalette = ExtractPaletteKeys<{ primary: 'oklch(...)', secondary: 'oklch(...)' }>
 * // MyPalette = 'primary' | 'secondary'
 */
export type ExtractPaletteKeys<P extends Record<string, string>> = keyof P

/**
 * Extract shade names from ColorShades
 *
 * @example
 * type Shades = ExtractShadeKeys
 * // Shades = 'lightest' | 'lighter' | 'light' | 'base' | 'dark' | 'darker' | 'darkest'
 */
export type ExtractShadeKeys = keyof ColorShades

/**
 * Type-safe unit value accessor
 * Provides autocomplete for unit values based on configuration
 *
 * @example
 * type RemValue = UnitValue<{ rem: [0, 0.25, 4] }, 'rem'>
 * // RemValue = string (with autocomplete for 0, 0.25, 0.5, ...)
 */
export type UnitValue<T extends UnitsConfig, U extends keyof T> = T[U] extends [number, number, number]
  ? ExpandedUnits<Pick<T, U>>[U] extends Record<infer K, string>
    ? K extends number
      ? K
      : never
    : never
  : never

/**
 * Type for inferring the complete theme tokens structure
 *
 * @example
 * type MyTheme = InferTokens<{
 *   units: { rem: [0, 0.25, 4] },
 *   palette: { primary: 'oklch(...)' }
 * }>
 */
export type InferTokens<
  T extends {
    units?: UnitsConfig
    palette?: Record<string, string>
    [key: string]: unknown
  },
> = T & {
  units: T['units'] extends UnitsConfig ? ExpandedUnits<T['units']> : never
  palette: T['palette'] extends Record<string, string>
    ? { [K in keyof T['palette']]: ColorShades }
    : never
}

/**
 * Utility to check if a value is a standard unit configuration
 * Returns the literal type union if standard, otherwise number
 *
 * @example
 * type RemKeys = InferUnitKeys<[0, 0.25, 4], 'rem'>
 * // If standard config: 0 | 0.25 | 0.5 | ... | 4
 * // Otherwise: number
 */
export type InferUnitKeys<
  Config extends [number, number, number],
  Unit extends string,
> = import('../lib/unitTypes').ConfigToScale<Unit, Config>

/**
 * Helper to create a type-safe theme configuration
 * Provides better IDE hints and autocomplete
 *
 * @example
 * const theme = createThemeType<{
 *   units: { rem: [0, 0.25, 4] as const }
 * }>({
 *   units: { rem: [0, 0.25, 4] }
 * })
 */
export function createThemeType<
  T extends {
    units?: UnitsConfig
    palette?: Record<string, string>
  },
>(config: T): InferTokens<T> {
  return config as InferTokens<T>
}
