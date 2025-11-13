import UNIT_SUFFIXES from './UNIT_SUFFIXES'

describe('UNIT_SUFFIXES', () => {
  describe('mapping structure', () => {
    it('should be an object', () => {
      expect(typeof UNIT_SUFFIXES).toBe('object')
      expect(UNIT_SUFFIXES).not.toBeNull()
    })

    it('should contain all expected CSS unit types', () => {
      const expectedUnits = ['rem', 'em', 'px', 'percentage', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'ex']
      expectedUnits.forEach((unit) => {
        expect(UNIT_SUFFIXES).toHaveProperty(unit)
      })
    })

    it('should have exactly 10 unit types', () => {
      expect(Object.keys(UNIT_SUFFIXES)).toHaveLength(10)
    })
  })

  describe('suffix mappings', () => {
    it('should map basic units to themselves', () => {
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

    it('should map percentage to % symbol', () => {
      expect(UNIT_SUFFIXES.percentage).toBe('%')
    })
  })

  describe('type safety', () => {
    it('should have all values as strings', () => {
      Object.values(UNIT_SUFFIXES).forEach((suffix) => {
        expect(typeof suffix).toBe('string')
      })
    })

    it('should have non-empty suffixes', () => {
      Object.values(UNIT_SUFFIXES).forEach((suffix) => {
        expect(suffix.length).toBeGreaterThan(0)
      })
    })
  })

  describe('immutability', () => {
    it('should be frozen (as const)', () => {
      expect(Object.isFrozen(UNIT_SUFFIXES)).toBe(true)
    })
  })
})
