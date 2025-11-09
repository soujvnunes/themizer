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

  it('should generate all single letters (a-z)', () => {
    expect(minifyVariableName(0)).toBe('a0')
    expect(minifyVariableName(10)).toBe('b0')
    expect(minifyVariableName(20)).toBe('c0')
    expect(minifyVariableName(250)).toBe('z0')
    expect(minifyVariableName(259)).toBe('z9')
  })

  it('should transition to double letters after z9', () => {
    expect(minifyVariableName(260)).toBe('aa0')
    expect(minifyVariableName(261)).toBe('aa1')
    expect(minifyVariableName(269)).toBe('aa9')
  })

  it('should generate double letter sequences', () => {
    expect(minifyVariableName(260)).toBe('aa0')
    expect(minifyVariableName(270)).toBe('ab0')
    expect(minifyVariableName(280)).toBe('ac0')
    expect(minifyVariableName(510)).toBe('az0')
    expect(minifyVariableName(520)).toBe('ba0')
  })

  it('should handle large counters', () => {
    // Counter 6760 is letterIndex 676 which maps to 'za'
    expect(minifyVariableName(6760)).toBe('za0')
    expect(minifyVariableName(6769)).toBe('za9')
    // letterIndex 701 = 'zz', counter 7010 = 'zz0'
    expect(minifyVariableName(7010)).toBe('zz0')
    expect(minifyVariableName(7019)).toBe('zz9')
    // letterIndex 702 = 'aaa', counter 7020 = 'aaa0'
    expect(minifyVariableName(7020)).toBe('aaa0')
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
})
