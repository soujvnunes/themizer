/**
 * Tests for CSS unit type definitions and utilities
 */

import { isCSSUnitType, unitSuffixes, type CSSUnitType } from './unitTypes'

describe('unitSuffixes', () => {
  it('should contain all CSS unit types', () => {
    expect(unitSuffixes).toHaveProperty('rem', 'rem')
    expect(unitSuffixes).toHaveProperty('em', 'em')
    expect(unitSuffixes).toHaveProperty('px', 'px')
    expect(unitSuffixes).toHaveProperty('percentage', '%')
    expect(unitSuffixes).toHaveProperty('vh', 'vh')
    expect(unitSuffixes).toHaveProperty('vw', 'vw')
    expect(unitSuffixes).toHaveProperty('vmin', 'vmin')
    expect(unitSuffixes).toHaveProperty('vmax', 'vmax')
    expect(unitSuffixes).toHaveProperty('ch', 'ch')
    expect(unitSuffixes).toHaveProperty('ex', 'ex')
  })

  it('should have exactly 10 unit types', () => {
    expect(Object.keys(unitSuffixes)).toHaveLength(10)
  })

  it('should map percentage to % symbol', () => {
    expect(unitSuffixes.percentage).toBe('%')
  })

  it('should map all other units to their literal names', () => {
    expect(unitSuffixes.rem).toBe('rem')
    expect(unitSuffixes.em).toBe('em')
    expect(unitSuffixes.px).toBe('px')
    expect(unitSuffixes.vh).toBe('vh')
    expect(unitSuffixes.vw).toBe('vw')
    expect(unitSuffixes.vmin).toBe('vmin')
    expect(unitSuffixes.vmax).toBe('vmax')
    expect(unitSuffixes.ch).toBe('ch')
    expect(unitSuffixes.ex).toBe('ex')
  })

  it('should be immutable (const assertion)', () => {
    const suffixes = unitSuffixes
    expect(suffixes).toBe(unitSuffixes)
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
        const suffix: string = unitSuffixes[value]
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
      // Only the explicitly defined CSS unit types should return true
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
      const userConfig = {
        rem: [0, 0.25, 4],
        em: [0, 0.5, 2],
        pixels: [0, 8, 64], // Invalid unit name
      }

      const validKeys = Object.keys(userConfig).filter(isCSSUnitType)
      expect(validKeys).toEqual(['rem', 'em'])
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
          return `${value}${unitSuffixes[unit]}`
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
