/**
 * Tests for type guard utilities
 */

import { isUnitsConfig } from './typeGuards'

describe('isUnitsConfig', () => {
  describe('valid cases', () => {
    it('should return true for valid units config with rem', () => {
      const config = { rem: [0, 0.25, 4] }
      expect(isUnitsConfig(config)).toBe(true)
    })

    it('should return true for valid units config with px', () => {
      const config = { px: [0, 4, 64] }
      expect(isUnitsConfig(config)).toBe(true)
    })

    it('should return true for valid units config with multiple unit types', () => {
      const config = {
        rem: [0, 0.25, 4],
        px: [0, 4, 64],
        percentage: [0, 10, 100],
      }
      expect(isUnitsConfig(config)).toBe(true)
    })

    it('should return true for valid units config with all CSS unit types', () => {
      const config = {
        rem: [0, 0.5, 2],
        em: [0, 0.5, 2],
        px: [0, 8, 64],
        percentage: [0, 25, 100],
        vh: [0, 10, 100],
        vw: [0, 10, 100],
        vmin: [0, 10, 100],
        vmax: [0, 10, 100],
        ch: [0, 1, 10],
        ex: [0, 1, 10],
      }
      expect(isUnitsConfig(config)).toBe(true)
    })

    it('should return true for empty object', () => {
      expect(isUnitsConfig({})).toBe(true)
    })

    it('should return true for units with negative values', () => {
      const config = { rem: [-2, 0.5, 2] }
      expect(isUnitsConfig(config)).toBe(true)
    })

    it('should return true for units with decimal values', () => {
      const config = { rem: [0.125, 0.125, 1.5] }
      expect(isUnitsConfig(config)).toBe(true)
    })

    it('should return true for units with zero step', () => {
      const config = { px: [16, 0, 16] }
      expect(isUnitsConfig(config)).toBe(true)
    })
  })

  describe('invalid cases - wrong types', () => {
    it('should return false for null', () => {
      expect(isUnitsConfig(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isUnitsConfig(undefined)).toBe(false)
    })

    it('should return false for string', () => {
      expect(isUnitsConfig('units')).toBe(false)
    })

    it('should return false for number', () => {
      expect(isUnitsConfig(42)).toBe(false)
    })

    it('should return false for boolean', () => {
      expect(isUnitsConfig(true)).toBe(false)
    })

    it('should return false for arrays', () => {
      expect(isUnitsConfig([0, 0.25, 4])).toBe(false)
    })

    it('should return false for functions', () => {
      expect(isUnitsConfig(() => {})).toBe(false)
    })
  })

  describe('invalid cases - wrong keys', () => {
    it('should return false for invalid CSS unit type', () => {
      const config = { invalid: [0, 1, 10] }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for custom property names like spacing', () => {
      const config = { spacing: [0, 0.25, 4] }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for numeric keys', () => {
      const config = { '16': [0, 4, 16] }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for mixed valid and invalid keys', () => {
      const config = {
        rem: [0, 0.25, 4],
        spacing: [0, 1, 10], // Invalid key
      }
      expect(isUnitsConfig(config)).toBe(false)
    })
  })

  describe('invalid cases - wrong tuple structure', () => {
    it('should return false for tuples with wrong length (less than 3)', () => {
      const config = { rem: [0, 0.25] }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for tuples with wrong length (more than 3)', () => {
      const config = { rem: [0, 0.25, 4, 8] }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for non-array values', () => {
      const config = { rem: '0 0.25 4' }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for object values', () => {
      const config = { rem: { from: 0, step: 0.25, to: 4 } }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for null values', () => {
      const config = { rem: null }
      expect(isUnitsConfig(config)).toBe(false)
    })
  })

  describe('invalid cases - wrong tuple values', () => {
    it('should return false for tuples with non-number values', () => {
      const config = { rem: ['0', '0.25', '4'] }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for tuples with NaN values', () => {
      const config = { rem: [0, NaN, 4] }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for tuples with Infinity values', () => {
      const config = { rem: [0, 0.25, Infinity] }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for tuples with -Infinity values', () => {
      const config = { rem: [-Infinity, 0.25, 4] }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for tuples with mixed valid/invalid values', () => {
      const config = { rem: [0, '0.25', 4] }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for tuples with null elements', () => {
      const config = { rem: [0, null, 4] }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for tuples with undefined elements', () => {
      const config = { rem: [0, undefined, 4] }
      expect(isUnitsConfig(config)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle objects with prototype properties', () => {
      const obj = Object.create({ inherited: [0, 1, 2] })
      obj.rem = [0, 0.25, 4]
      expect(isUnitsConfig(obj)).toBe(true)
    })

    it('should return false for nested units config', () => {
      const config = {
        spacing: {
          rem: [0, 0.25, 4],
        },
      }
      expect(isUnitsConfig(config)).toBe(false)
    })

    it('should return false for units config with additional properties', () => {
      const config = {
        rem: [0, 0.25, 4],
        toString: () => 'config', // Non-CSS unit property
      }
      expect(isUnitsConfig(config)).toBe(false)
    })
  })

  describe('real-world scenarios', () => {
    it('should validate common spacing configuration', () => {
      const spacingConfig = {
        rem: [0, 0.25, 4],
        px: [0, 4, 64],
      }
      expect(isUnitsConfig(spacingConfig)).toBe(true)
    })

    it('should validate typography scale configuration', () => {
      const typographyConfig = {
        rem: [0.75, 0.125, 4],
        em: [0.75, 0.125, 4],
      }
      expect(isUnitsConfig(typographyConfig)).toBe(true)
    })

    it('should reject Tailwind-like arbitrary values', () => {
      const invalidConfig = {
        spacing: {
          sm: '0.5rem',
          md: '1rem',
          lg: '2rem',
        },
      }
      expect(isUnitsConfig(invalidConfig)).toBe(false)
    })

    it('should reject mixed valid units with invalid structure', () => {
      const invalidConfig = {
        rem: [0, 0.25, 4], // Valid
        colors: { primary: '#000' }, // Invalid - not a unit type
      }
      expect(isUnitsConfig(invalidConfig)).toBe(false)
    })
  })
})