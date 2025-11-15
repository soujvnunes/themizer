import OKLAB_PATTERN from './OKLAB_PATTERN'

describe('OKLAB_PATTERN', () => {
  describe('valid oklab/oklch formats', () => {
    it('should match oklch format', () => {
      expect(OKLAB_PATTERN.test('oklch(76.9% 0.188 70.08)')).toBe(true)
      expect(OKLAB_PATTERN.test('oklch(50% 0.15 180)')).toBe(true)
      expect(OKLAB_PATTERN.test('oklch(0.769 0.188 70.08)')).toBe(true)
    })

    it('should match oklab format', () => {
      expect(OKLAB_PATTERN.test('oklab(0.5 0.1 -0.1)')).toBe(true)
      expect(OKLAB_PATTERN.test('oklab(0.769 0.188 -0.05)')).toBe(true)
      expect(OKLAB_PATTERN.test('oklab(50% 0.1 0.2)')).toBe(true)
    })

    it('should match with various spacing', () => {
      expect(OKLAB_PATTERN.test('oklch( 50% 0.15 180 )')).toBe(true)
      expect(OKLAB_PATTERN.test('oklab(  0.5   0.1   -0.1  )')).toBe(true)
    })

    it('should match with negative values', () => {
      expect(OKLAB_PATTERN.test('oklch(50% 0.15 -30)')).toBe(true)
      expect(OKLAB_PATTERN.test('oklab(0.5 -0.1 -0.2)')).toBe(true)
    })
  })

  describe('invalid formats', () => {
    it('should not match other color formats', () => {
      expect(OKLAB_PATTERN.test('#ff0000')).toBe(false)
      expect(OKLAB_PATTERN.test('rgb(255, 0, 0)')).toBe(false)
      expect(OKLAB_PATTERN.test('hsl(0, 100%, 50%)')).toBe(false)
      expect(OKLAB_PATTERN.test('lch(50% 50 180)')).toBe(false)
      expect(OKLAB_PATTERN.test('lab(50 25 -25)')).toBe(false)
    })

    it('should not match incomplete formats', () => {
      expect(OKLAB_PATTERN.test('oklch')).toBe(false)
      expect(OKLAB_PATTERN.test('oklab')).toBe(false)
      expect(OKLAB_PATTERN.test('oklch(')).toBe(false)
      expect(OKLAB_PATTERN.test('oklab)')).toBe(false)
    })

    it('should not match with missing parentheses', () => {
      expect(OKLAB_PATTERN.test('oklch 50% 0.15 180')).toBe(false)
      expect(OKLAB_PATTERN.test('oklab 0.5 0.1 -0.1')).toBe(false)
    })

    it('should not match with typos', () => {
      expect(OKLAB_PATTERN.test('oklhc(50% 0.15 180)')).toBe(false)
      expect(OKLAB_PATTERN.test('okbal(0.5 0.1 -0.1)')).toBe(false)
      expect(OKLAB_PATTERN.test('ok(50% 0.15 180)')).toBe(false)
    })
  })

  describe('regex properties', () => {
    it('should be a RegExp instance', () => {
      expect(OKLAB_PATTERN).toBeInstanceOf(RegExp)
    })

    it('should match from start to end of string', () => {
      expect(OKLAB_PATTERN.test('prefix oklch(50% 0.15 180)')).toBe(false)
      expect(OKLAB_PATTERN.test('oklab(0.5 0.1 -0.1) suffix')).toBe(false)
    })
  })
})
