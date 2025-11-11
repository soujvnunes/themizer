/**
 * Type-safe CSS unit definitions for themizer
 */

/**
 * Allowed CSS unit types for the units configuration
 */
export type CSSUnitType =
  | 'rem'
  | 'em'
  | 'px'
  | 'percentage'
  | 'vh'
  | 'vw'
  | 'vmin'
  | 'vmax'
  | 'ch'
  | 'ex'

/**
 * Configuration type for units in themizer
 * Each unit type maps to a tuple of [from, step, to]
 */
export type UnitsConfig = {
  [K in CSSUnitType]?: [number, number, number]
}

/**
 * Mapping of unit names to their CSS suffixes
 */
export const unitSuffixes: Record<CSSUnitType, string> = {
  rem: 'rem',
  em: 'em',
  px: 'px',
  percentage: '%',
  vh: 'vh',
  vw: 'vw',
  vmin: 'vmin',
  vmax: 'vmax',
  ch: 'ch',
  ex: 'ex',
} as const

/**
 * Type guard to check if a string is a valid CSS unit type
 */
export function isCSSUnitType(value: string): value is CSSUnitType {
  return value in unitSuffixes
}

/**
 * Type for the expanded units structure
 */
export type ExpandedUnits<T extends UnitsConfig> = {
  [K in keyof T]: T[K] extends [number, number, number] ? Record<number, string> : never
}
