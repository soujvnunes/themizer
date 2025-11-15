/**
 * Tests for CSS unit type definitions and utilities
 */

import {
  isCSSUnitType,
  type CSSUnitType,
  type ExpandedUnits,
  type ConfigToScale,
  type RemScale,
  type PxScale,
  type PxScaleSmall,
  type PercentageScale,
  type PercentageQuarters,
} from './unitTypes'
import UNIT_SUFFIXES from '../consts/UNIT_SUFFIXES'

describe('unitSuffixes', () => {
  it('should contain all CSS unit types', () => {
    expect(UNIT_SUFFIXES).toHaveProperty('rem', 'rem')
    expect(UNIT_SUFFIXES).toHaveProperty('em', 'em')
    expect(UNIT_SUFFIXES).toHaveProperty('px', 'px')
    expect(UNIT_SUFFIXES).toHaveProperty('percentage', '%')
    expect(UNIT_SUFFIXES).toHaveProperty('vh', 'vh')
    expect(UNIT_SUFFIXES).toHaveProperty('vw', 'vw')
    expect(UNIT_SUFFIXES).toHaveProperty('vmin', 'vmin')
    expect(UNIT_SUFFIXES).toHaveProperty('vmax', 'vmax')
    expect(UNIT_SUFFIXES).toHaveProperty('ch', 'ch')
    expect(UNIT_SUFFIXES).toHaveProperty('ex', 'ex')
  })

  it('should have exactly 10 unit types', () => {
    expect(Object.keys(UNIT_SUFFIXES)).toHaveLength(10)
  })

  it('should map percentage to % symbol', () => {
    expect(UNIT_SUFFIXES.percentage).toBe('%')
  })

  it('should map all other units to their literal names', () => {
    expect(UNIT_SUFFIXES.rem).toBe('rem')
    expect(UNIT_SUFFIXES.em).toBe('em')
    expect(UNIT_SUFFIXES.px).toBe('px')
    expect(UNIT_SUFFIXES.vh).toBe('vh')
    expect(UNIT_SUFFIXES.vw).toBe('vw')
    expect(UNIT_SUFFIXES.vmin).toBe('vmin')
    expect(UNIT_SUFFIXES.vmax).toBe('vmax')
    expect(UNIT_SUFFIXES.ch).toBe('ch')
    expect(UNIT_SUFFIXES.ex).toBe('ex')
  })

  it('should be immutable (const assertion)', () => {
    const suffixes = UNIT_SUFFIXES
    expect(suffixes).toBe(UNIT_SUFFIXES)
  })
})

describe('isCSSUnitType', () => {
  describe('valid CSS unit types', () => {
    it('should return true for rem', () => {
      expect(isCSSUnitType('rem')).toBe(true)
    })

    it('should return true for em', () => {
      expect(isCSSUnitType('em')).toBe(true)
    })

    it('should return true for px', () => {
      expect(isCSSUnitType('px')).toBe(true)
    })

    it('should return true for percentage', () => {
      expect(isCSSUnitType('percentage')).toBe(true)
    })

    it('should return true for viewport units', () => {
      expect(isCSSUnitType('vh')).toBe(true)
      expect(isCSSUnitType('vw')).toBe(true)
      expect(isCSSUnitType('vmin')).toBe(true)
      expect(isCSSUnitType('vmax')).toBe(true)
    })

    it('should return true for character units', () => {
      expect(isCSSUnitType('ch')).toBe(true)
      expect(isCSSUnitType('ex')).toBe(true)
    })

    it('should return true for all defined unit types', () => {
      const allUnits: CSSUnitType[] = [
        'rem',
        'em',
        'px',
        'percentage',
        'vh',
        'vw',
        'vmin',
        'vmax',
        'ch',
        'ex',
      ]

      allUnits.forEach((unit) => {
        expect(isCSSUnitType(unit)).toBe(true)
      })
    })
  })

  describe('invalid CSS unit types', () => {
    it('should return false for common but unsupported units', () => {
      expect(isCSSUnitType('pt')).toBe(false)
      expect(isCSSUnitType('pc')).toBe(false)
      expect(isCSSUnitType('in')).toBe(false)
      expect(isCSSUnitType('cm')).toBe(false)
      expect(isCSSUnitType('mm')).toBe(false)
    })

    it('should return false for CSS unit symbols', () => {
      expect(isCSSUnitType('%')).toBe(false)
    })

    it('should return false for custom property names', () => {
      expect(isCSSUnitType('spacing')).toBe(false)
      expect(isCSSUnitType('size')).toBe(false)
      expect(isCSSUnitType('width')).toBe(false)
      expect(isCSSUnitType('height')).toBe(false)
    })

    it('should return false for numeric strings', () => {
      expect(isCSSUnitType('0')).toBe(false)
      expect(isCSSUnitType('16')).toBe(false)
      expect(isCSSUnitType('24')).toBe(false)
      expect(isCSSUnitType('100')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isCSSUnitType('')).toBe(false)
    })

    it('should return false for case variations', () => {
      expect(isCSSUnitType('REM')).toBe(false)
      expect(isCSSUnitType('Rem')).toBe(false)
      expect(isCSSUnitType('PX')).toBe(false)
      expect(isCSSUnitType('Percentage')).toBe(false)
    })

    it('should return false for units with spaces', () => {
      expect(isCSSUnitType(' rem')).toBe(false)
      expect(isCSSUnitType('rem ')).toBe(false)
      expect(isCSSUnitType(' rem ')).toBe(false)
    })

    it('should return false for compound values', () => {
      expect(isCSSUnitType('1rem')).toBe(false)
      expect(isCSSUnitType('16px')).toBe(false)
      expect(isCSSUnitType('100%')).toBe(false)
    })

    it('should return false for special characters', () => {
      expect(isCSSUnitType('rem!')).toBe(false)
      expect(isCSSUnitType('px@')).toBe(false)
      expect(isCSSUnitType('em#')).toBe(false)
    })

    it('should return false for null-like values', () => {
      expect(isCSSUnitType('null')).toBe(false)
      expect(isCSSUnitType('undefined')).toBe(false)
      expect(isCSSUnitType('NaN')).toBe(false)
    })

    it('should return false for boolean strings', () => {
      expect(isCSSUnitType('true')).toBe(false)
      expect(isCSSUnitType('false')).toBe(false)
    })
  })

  describe('type guard behavior', () => {
    it('should narrow type to CSSUnitType', () => {
      const value = 'rem'

      if (isCSSUnitType(value)) {
        const suffix: string = UNIT_SUFFIXES[value]
        expect(suffix).toBe('rem')
      }
    })

    it('should work with Object.keys iteration', () => {
      const config = {
        rem: [0, 0.25, 4],
        spacing: [0, 1, 10],
        px: [0, 4, 64],
      }

      const validUnits = Object.keys(config).filter(isCSSUnitType)
      expect(validUnits).toEqual(['rem', 'px'])
    })
  })

  describe('edge cases', () => {
    it('should only accept defined CSS unit types', () => {
      const invalidKeys = ['invalid', 'custom', 'spacing', 'size']
      invalidKeys.forEach((key) => {
        expect(isCSSUnitType(key)).toBe(false)
      })
    })

    it('should handle unicode characters', () => {
      expect(isCSSUnitType('rëm')).toBe(false)
      expect(isCSSUnitType('пикс')).toBe(false)
      expect(isCSSUnitType('レム')).toBe(false)
      expect(isCSSUnitType('😀')).toBe(false)
    })

    it('should handle very long strings', () => {
      const longString = 'rem'.repeat(1000)
      expect(isCSSUnitType(longString)).toBe(false)
    })
  })

  describe('real-world usage', () => {
    it('should validate units from user configuration', () => {
      expect(
        Object.keys({
          rem: [0, 0.25, 4],
          em: [0, 0.5, 2],
          pixels: [0, 8, 64],
        }).filter(isCSSUnitType),
      ).toEqual(['rem', 'em'])
    })

    it('should distinguish between units and custom properties', () => {
      const tokens = {
        rem: [0, 0.25, 4],
        spacing: { small: '0.5rem', large: '2rem' },
        px: [0, 4, 64],
        colors: { primary: '#000' },
      }

      const unitKeys = Object.keys(tokens).filter(isCSSUnitType)
      expect(unitKeys).toEqual(['rem', 'px'])
    })

    it('should work with unit suffix mapping', () => {
      const generateValue = (value: number, unit: string): string | null => {
        if (isCSSUnitType(unit)) {
          return `${value}${UNIT_SUFFIXES[unit]}`
        }
        return null
      }

      expect(generateValue(1, 'rem')).toBe('1rem')
      expect(generateValue(16, 'px')).toBe('16px')
      expect(generateValue(100, 'percentage')).toBe('100%')
      expect(generateValue(50, 'invalid')).toBeNull()
    })
  })
})

type Expect<T extends true> = T
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

describe('ExpandedUnits with literal types', () => {
  it('should infer literal keys for standard rem config', () => {
    type TestConfig = { rem: [0, 0.25, 4] }
    type Expanded = ExpandedUnits<TestConfig>
    type RemKeys = keyof Expanded['rem']

    type _Test = Expect<Equal<RemKeys, RemScale>>

    const config: TestConfig = { rem: [0, 0.25, 4] }
    expect(config.rem).toEqual([0, 0.25, 4])
  })

  it('should infer literal keys for standard px config', () => {
    type TestConfig = { px: [0, 4, 64] }
    type Expanded = ExpandedUnits<TestConfig>
    type PxKeys = keyof Expanded['px']

    type _Test = Expect<Equal<PxKeys, PxScale>>

    const config: TestConfig = { px: [0, 4, 64] }
    expect(config.px).toEqual([0, 4, 64])
  })

  it('should infer literal keys for small px config', () => {
    type TestConfig = { px: [0, 4, 16] }
    type Expanded = ExpandedUnits<TestConfig>
    type PxKeys = keyof Expanded['px']

    type _Test = Expect<Equal<PxKeys, PxScaleSmall>>

    const config: TestConfig = { px: [0, 4, 16] }
    expect(config.px).toEqual([0, 4, 16])
  })

  it('should fallback to number for non-standard config', () => {
    type TestConfig = { rem: [0, 0.33, 5] }
    type Expanded = ExpandedUnits<TestConfig>
    type RemKeys = keyof Expanded['rem']

    type _Test = Expect<Equal<RemKeys, number>>

    const config: TestConfig = { rem: [0, 0.33, 5] }
    expect(config.rem).toEqual([0, 0.33, 5])
  })

  it('should provide autocomplete for standard configs', () => {
    type Theme = {
      units: ExpandedUnits<{ rem: [0, 0.25, 4]; px: [0, 4, 16] }>
    }

    type RemRecord = Theme['units']['rem']
    type RemKeys = keyof RemRecord

    type _Test1 = Expect<Equal<RemKeys, RemScale>>

    type PxRecord = Theme['units']['px']
    type PxKeys = keyof PxRecord

    type _Test2 = Expect<Equal<PxKeys, PxScaleSmall>>

    const validAccess = (theme: Theme) => {
      const rem1 = theme.units.rem[0.5]
      const px1 = theme.units.px[8]
      return { rem1, px1 }
    }

    expect(validAccess).toBeDefined()
  })

  it('should show type errors for invalid keys', () => {
    type Theme = {
      units: ExpandedUnits<{ rem: [0, 0.25, 4] }>
    }

    const invalidAccess = (theme: Theme) => {
      // @ts-expect-error - 0.33 is not in RemScale
      const invalid1 = theme.units.rem[0.33]
      // @ts-expect-error - 5 is not in RemScale
      const invalid2 = theme.units.rem[5]
      const valid = theme.units.rem[0.5]

      return { invalid1, invalid2, valid }
    }

    expect(invalidAccess).toBeDefined()
  })
})

describe('ConfigToScale type mapping', () => {
  it('should map standard rem config to RemScale', () => {
    type Scale = ConfigToScale<'rem', [0, 0.25, 4]>
    type _Test = Expect<Equal<Scale, RemScale>>

    const validKeys: RemScale[] = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
    expect(validKeys).toContain(0.5)
  })

  it('should map standard px config to PxScale', () => {
    type Scale = ConfigToScale<'px', [0, 4, 64]>
    type _Test = Expect<Equal<Scale, PxScale>>

    const validKeys: PxScale[] = [0, 4, 8, 12, 16, 20, 24]
    expect(validKeys).toContain(8)
  })

  it('should return number for custom configs', () => {
    type Scale = ConfigToScale<'rem', [0, 0.1, 2]>
    type _Test = Expect<Equal<Scale, number>>

    const value: Scale = 0.7
    expect(value).toBe(0.7)
  })

  it('should map percentage configs correctly', () => {
    type Scale1 = ConfigToScale<'percentage', [0, 5, 100]>
    type Scale2 = ConfigToScale<'percentage', [0, 25, 100]>

    type _Test1 = Expect<Equal<Scale1, PercentageScale>>
    type _Test2 = Expect<Equal<Scale2, PercentageQuarters>>

    const val1: Scale1 = 15
    const val2: Scale2 = 75

    expect(val1).toBe(15)
    expect(val2).toBe(75)
  })
})
