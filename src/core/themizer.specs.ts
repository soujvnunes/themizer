/**
 * Example demonstrating improved type inference for units expansion
 * This shows how IntelliSense now provides autocomplete for standard unit configurations
 */

import themizer from './themizer'
import type { ExpandedUnits } from '../lib/unitTypes'
import type { ExtractUnitKeys, UnitValue } from '../types/helpers'

// Example 1: Standard configurations get literal type inference
const themeWithStandardUnits = themizer(
  {
    prefix: 'app',
    medias: {},
    tokens: {
      units: {
        // Standard rem scale: [0, 0.25, 4]
        rem: [0, 0.25, 4],
        // Standard px scale: [0, 4, 64]
        px: [0, 4, 64],
      },
    },
  },
  () => ({}),
)

// ✅ IntelliSense now shows available keys: 0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4
const _spacing1 = themeWithStandardUnits.tokens.units.rem[0.5]
const _spacing2 = themeWithStandardUnits.tokens.units.rem[1]
const _spacing3 = themeWithStandardUnits.tokens.units.rem[2.5]

// ✅ IntelliSense shows px keys: 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64
const _size1 = themeWithStandardUnits.tokens.units.px[16]
const _size2 = themeWithStandardUnits.tokens.units.px[32]

// @ts-expect-error Property '0.33' does not exist
const _invalid1 = themeWithStandardUnits.tokens.units.rem[0.33]
// @ts-expect-error Property '5' does not exist
const _invalid2 = themeWithStandardUnits.tokens.units.px[5]

// Example 2: Custom configurations fall back to generic number keys
const themeWithCustomUnits = themizer(
  {
    prefix: 'custom',
    medias: {},
    tokens: {
      units: {
        // Custom scale - not a standard configuration
        rem: [0, 0.33, 5],
        // Another custom scale
        px: [0, 3, 99],
      },
    },
  },
  () => ({}),
)

// For custom scales, any number key is valid (no specific IntelliSense)
const _customSpacing1 = themeWithCustomUnits.tokens.units.rem[0.33]
const _customSpacing2 = themeWithCustomUnits.tokens.units.rem[0.66]
const _customSpacing3 = themeWithCustomUnits.tokens.units.rem[1.32]
const _customSize = themeWithCustomUnits.tokens.units.px[15]

type StandardUnitsConfig = {
  rem: [0, 0.25, 4]
  px: [0, 4, 16] // Small px scale
}

// Extract available keys for each unit
type _AvailableKeys = ExtractUnitKeys<StandardUnitsConfig>
// _AvailableKeys['rem'] = 0 | 0.25 | 0.5 | 0.75 | 1 | ... | 4
// _AvailableKeys['px'] = 0 | 4 | 8 | 12 | 16

// Get specific unit values
type RemValues = UnitValue<StandardUnitsConfig, 'rem'>
type PxValues = UnitValue<StandardUnitsConfig, 'px'>

// Use in functions with type safety
function applySpacing(value: RemValues): string {
  return `${value}rem`
}

function applySize(value: PxValues): string {
  return `${value}px`
}

// ✅ Valid calls
applySpacing(0.5)
applySpacing(1)
applySize(8)
applySize(16)

// @ts-expect-error Argument of type '0.33' is not assignable
applySpacing(0.33)
// @ts-expect-error Argument of type '5' is not assignable
applySize(5)

// Example 4: Direct type usage for better IDE experience
type MyThemeUnits = ExpandedUnits<{
  rem: [0, 0.25, 4]
  em: [0, 0.25, 4]
  px: [0, 4, 64]
  percentage: [0, 25, 100]
}>

// Now MyThemeUnits has full type information:
// {
//   rem: Record<0 | 0.25 | 0.5 | ... | 4, string>
//   em: Record<0 | 0.25 | 0.5 | ... | 4, string>
//   px: Record<0 | 4 | 8 | ... | 64, string>
//   percentage: Record<0 | 25 | 50 | 75 | 100, string>
// }

function _createComponent(units: MyThemeUnits) {
  return {
    padding: units.rem[1],
    margin: units.px[16],
    width: units.percentage[50],
  }
}
