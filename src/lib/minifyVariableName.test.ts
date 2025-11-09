import { minifyVariableName } from './minifyVariableName'

describe('minifyVariableName', () => {
  it('should generate single letter with digit (a0-a9)', () => {
    expect(minifyVariableName(0)).toBe('a0')
    expect(minifyVariableName(1)).toBe('a1')
    expect(minifyVariableName(5)).toBe('a5')
    expect(minifyVariableName(9)).toBe('a9')
  })

  it('should transition to next letter (b0-b9)', () => {
    expect(minifyVariableName(10)).toBe('b0')
    expect(minifyVariableName(11)).toBe('b1')
    expect(minifyVariableName(19)).toBe('b9')
  })

  it('should generate all lowercase single letters (a-z)', () => {
    expect(minifyVariableName(0)).toBe('a0')
    expect(minifyVariableName(10)).toBe('b0')
    expect(minifyVariableName(20)).toBe('c0')
    expect(minifyVariableName(250)).toBe('z0')
    expect(minifyVariableName(259)).toBe('z9')
  })

  it('should transition to uppercase letters after z9', () => {
    expect(minifyVariableName(260)).toBe('A0')
    expect(minifyVariableName(261)).toBe('A1')
    expect(minifyVariableName(269)).toBe('A9')
  })

  it('should generate all uppercase single letters (A-Z)', () => {
    expect(minifyVariableName(260)).toBe('A0')
    expect(minifyVariableName(270)).toBe('B0')
    expect(minifyVariableName(510)).toBe('Z0')
    expect(minifyVariableName(519)).toBe('Z9')
  })

  it('should transition to double letters after Z9', () => {
    expect(minifyVariableName(520)).toBe('aa0')
    expect(minifyVariableName(521)).toBe('aa1')
    expect(minifyVariableName(529)).toBe('aa9')
  })

  it('should generate double letter sequences', () => {
    expect(minifyVariableName(520)).toBe('aa0')
    expect(minifyVariableName(530)).toBe('ab0')
    expect(minifyVariableName(540)).toBe('ac0')
    expect(minifyVariableName(770)).toBe('az0')
    expect(minifyVariableName(780)).toBe('aA0')
    expect(minifyVariableName(1030)).toBe('aZ0')
    expect(minifyVariableName(1040)).toBe('ba0')
  })

  it('should handle large counters', () => {
    // With bijective base-52: a-Z (52), aa-ZZ (52^2=2704), aaa-ZZZ (52^3), etc.
    // For 'zz': index = 52 + (25*52 + 25) = 52 + 1325 = 1377
    expect(minifyVariableName(13770)).toBe('zz0')
    expect(minifyVariableName(13779)).toBe('zz9')
    // For 'AA': index = 52 + (26*52 + 26) = 52 + 1378 = 1430
    expect(minifyVariableName(14300)).toBe('AA0')
    expect(minifyVariableName(14309)).toBe('AA9')
    // For 'ZZ': index = 52 + (51*52 + 51) = 52 + 2703 = 2755 (end of 2-char)
    expect(minifyVariableName(27550)).toBe('ZZ0')
    expect(minifyVariableName(27559)).toBe('ZZ9')
    // For 'aaa': index = 2756 (start of 3-char)
    expect(minifyVariableName(27560)).toBe('aaa0')
  })

  it('should generate sequential unique names', () => {
    const names = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      const name = minifyVariableName(i)
      expect(names.has(name)).toBe(false)
      names.add(name)
    }
    expect(names.size).toBe(1000)
  })

  describe('with prefix', () => {
    it('should use prefix instead of initial letter', () => {
      expect(minifyVariableName(0, 'ds')).toBe('ds0')
      expect(minifyVariableName(1, 'ds')).toBe('ds1')
      expect(minifyVariableName(9, 'ds')).toBe('ds9')
      expect(minifyVariableName(10, 'ds')).toBe('dsa0')
      expect(minifyVariableName(19, 'ds')).toBe('dsa9')
      expect(minifyVariableName(20, 'ds')).toBe('dsb0')
      expect(minifyVariableName(260, 'ds')).toBe('dsz0')
      expect(minifyVariableName(270, 'ds')).toBe('dsA0')
      expect(minifyVariableName(520, 'ds')).toBe('dsZ0')
      expect(minifyVariableName(530, 'ds')).toBe('dsaa0')
    })

    it('should work with different prefixes', () => {
      expect(minifyVariableName(0, 'ui')).toBe('ui0')
      expect(minifyVariableName(9, 'ui')).toBe('ui9')
      expect(minifyVariableName(10, 'ui')).toBe('uia0')
      expect(minifyVariableName(10, 'theme')).toBe('themea0')
      expect(minifyVariableName(520, 'app')).toBe('appZ0')
      expect(minifyVariableName(530, 'app')).toBe('appaa0')
    })

    it('should prevent collisions between different prefixes', () => {
      const ds0 = minifyVariableName(0, 'ds')
      const ui0 = minifyVariableName(0, 'ui')
      const theme0 = minifyVariableName(0, 'theme')

      expect(ds0).toBe('ds0')
      expect(ui0).toBe('ui0')
      expect(theme0).toBe('theme0')
      expect(ds0).not.toBe(ui0)
      expect(ds0).not.toBe(theme0)
      expect(ui0).not.toBe(theme0)
    })

    it('should generate unique names with prefix', () => {
      const names = new Set<string>()
      for (let i = 0; i < 100; i++) {
        const name = minifyVariableName(i, 'test')
        expect(names.has(name)).toBe(false)
        names.add(name)
      }
      expect(names.size).toBe(100)
    })
  })
})
