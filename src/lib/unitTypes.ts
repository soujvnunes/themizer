/**
 * Type-safe CSS unit definitions for themizer
 */

import UNIT_SUFFIXES from '../consts/UNIT_SUFFIXES'

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
 * Type guard to check if a string is a valid CSS unit type
 */
export function isCSSUnitType(value: string): value is CSSUnitType {
  return value in UNIT_SUFFIXES
}

/**
 * Standard rem scale: 0 to 4 with 0.25 step
 * Commonly used for spacing and typography
 */
export type RemScale =
  | 0
  | 0.25
  | 0.5
  | 0.75
  | 1
  | 1.25
  | 1.5
  | 1.75
  | 2
  | 2.25
  | 2.5
  | 2.75
  | 3
  | 3.25
  | 3.5
  | 3.75
  | 4

/**
 * Extended rem scale: 0 to 8 with 0.25 step
 * For projects needing larger spacing values
 */
export type RemScaleExtended =
  | RemScale
  | 4.25
  | 4.5
  | 4.75
  | 5
  | 5.25
  | 5.5
  | 5.75
  | 6
  | 6.25
  | 6.5
  | 6.75
  | 7
  | 7.25
  | 7.5
  | 7.75
  | 8

/**
 * Standard px scale: 0 to 64 with 4px step
 * Common for spacing, padding, margins
 */
export type PxScale = 0 | 4 | 8 | 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 44 | 48 | 52 | 56 | 60 | 64

/**
 * Smaller px scale: 0 to 16 with 4px step
 * For fine-grained control
 */
export type PxScaleSmall = 0 | 4 | 8 | 12 | 16

/**
 * Large px scale: 0 to 128 with 8px step
 * For larger layouts and components
 */
export type PxScaleLarge =
  | 0
  | 8
  | 16
  | 24
  | 32
  | 40
  | 48
  | 56
  | 64
  | 72
  | 80
  | 88
  | 96
  | 104
  | 112
  | 120
  | 128

/**
 * Standard percentage scale: 0 to 100 with 5% step
 */
export type PercentageScale =
  | 0
  | 5
  | 10
  | 15
  | 20
  | 25
  | 30
  | 35
  | 40
  | 45
  | 50
  | 55
  | 60
  | 65
  | 70
  | 75
  | 80
  | 85
  | 90
  | 95
  | 100

/**
 * Quarter percentage scale: 0 to 100 with 25% step
 */
export type PercentageQuarters = 0 | 25 | 50 | 75 | 100

/**
 * Viewport unit scales (vh, vw, vmin, vmax)
 * Common values for responsive layouts
 */
export type ViewportScale =
  | 0
  | 10
  | 20
  | 25
  | 30
  | 33.33
  | 40
  | 50
  | 60
  | 66.67
  | 70
  | 75
  | 80
  | 90
  | 100

/**
 * Em scale: Similar to rem but relative to parent
 */
export type EmScale = RemScale

/**
 * Character unit scale (ch): Common for typography
 */
export type ChScale = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80

/**
 * Ex unit scale: Relative to x-height
 */
export type ExScale = 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4

/**
 * Map standard configurations to their scale types
 */
export type ConfigToScale<Unit extends string, Config> = Unit extends 'rem'
  ? Config extends [0, 0.25, 4]
    ? RemScale
    : Config extends [0, 0.25, 8]
    ? RemScaleExtended
    : number
  : Unit extends 'px'
  ? Config extends [0, 4, 16]
    ? PxScaleSmall
    : Config extends [0, 4, 64]
    ? PxScale
    : Config extends [0, 8, 128]
    ? PxScaleLarge
    : number
  : Unit extends 'percentage'
  ? Config extends [0, 5, 100]
    ? PercentageScale
    : Config extends [0, 25, 100]
    ? PercentageQuarters
    : number
  : Unit extends 'em'
  ? Config extends [0, 0.25, 4]
    ? EmScale
    : number
  : Unit extends 'vh' | 'vw' | 'vmin' | 'vmax'
  ? Config extends [0, 10, 100]
    ? ViewportScale
    : number
  : Unit extends 'ch'
  ? Config extends [0, 10, 80]
    ? ChScale
    : number
  : Unit extends 'ex'
  ? Config extends [0, 0.5, 4]
    ? ExScale
    : number
  : number

/**
 * Type for the expanded units structure
 * Now with literal type inference for standard configurations
 */
export type ExpandedUnits<T extends UnitsConfig> = {
  [K in keyof T]: T[K] extends [number, number, number]
    ? {
        [Value in ConfigToScale<Extract<K, string>, T[K]>]: string
      }
    : never
}
