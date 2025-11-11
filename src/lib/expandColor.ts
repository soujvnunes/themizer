/**
 * Color expansion utilities
 * Expands a single base color into 7 shades using direct OKLCH manipulation
 */

import { formatOklch, parseOklch } from './colorConversion'

export interface ColorShades {
  [key: string]: string
  lightest: string
  lighter: string
  light: string
  base: string
  dark: string
  darker: string
  darkest: string
}

/**
 * Expand a single oklch color into 7 shades
 * @param baseColor OKLCH color string (e.g., 'oklch(76.9% 0.188 70.08)')
 * @returns Object with 7 shade keys
 */
export function expandColor(baseColor: string): ColorShades {
  // Parse base color
  const base = parseOklch(baseColor)

  // Design system constants for shade generation
  // These create perceptually balanced shades optimized for UI design
  const LIGHTEST_L = 98.92
  const LIGHTER_L = 96.2
  const LIGHT_L_OFFSET = 5.9 // light = base.l + 5.9
  const DARK_L_OFFSET = -10.3 // dark = base.l - 10.3
  const DARKER_L = 35
  const DARKEST_L = 14.92

  // Chroma values - variable at extremes for sophisticated tones
  const LIGHTEST_CHROMA = 0.0102 // Very desaturated for clean backgrounds
  const DARKEST_CHROMA = 0.0268 // More saturated for richer depth
  const LIGHTER_C_FACTOR = 0.314 // lighter.c = base.c * 0.314
  const LIGHT_C_FACTOR = 1.005 // light.c ≈ base.c
  const DARK_C_FACTOR = 0.952 // dark.c = base.c * 0.952
  const DARKER_C_FACTOR = 0.41 // darker.c = base.c * 0.41

  // Hue shifts - warm for both extremes, cool for mid-darks
  const LIGHTEST_H_SHIFT = 11.72 // Warm shift for lightest
  const LIGHTER_H_SHIFT = 25.537
  const LIGHT_H_SHIFT = 14.349
  const DARK_H_SHIFT = -11.762
  const DARKER_H_SHIFT = -24.445
  const DARKEST_H_SHIFT = 15.69 // Warm shift for darkest

  // Calculate shade values
  const lightL = base.l + LIGHT_L_OFFSET
  const darkL = base.l + DARK_L_OFFSET

  // Chroma calculations
  const lighterC = base.c * LIGHTER_C_FACTOR
  const lightC = base.c * LIGHT_C_FACTOR
  const darkC = base.c * DARK_C_FACTOR
  const darkerC = base.c * DARKER_C_FACTOR

  return {
    lightest: formatOklch(LIGHTEST_L, LIGHTEST_CHROMA, base.h + LIGHTEST_H_SHIFT),
    lighter: formatOklch(LIGHTER_L, lighterC, base.h + LIGHTER_H_SHIFT),
    light: formatOklch(lightL, lightC, base.h + LIGHT_H_SHIFT),
    base: baseColor,
    dark: formatOklch(darkL, darkC, base.h + DARK_H_SHIFT),
    darker: formatOklch(DARKER_L, darkerC, base.h + DARKER_H_SHIFT),
    darkest: formatOklch(DARKEST_L, DARKEST_CHROMA, base.h + DARKEST_H_SHIFT),
  }
}
