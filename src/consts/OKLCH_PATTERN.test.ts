import OKLCH_PATTERN from './OKLCH_PATTERN'

describe('OKLCH_PATTERN', () => {
  describe('valid oklch formats', () => {
    it('should match oklch with percentage lightness', () => {
      expect(OKLCH_PATTERN.test('oklch(76.9% 0.188 70.08)')).toBe(true)
      expect(OKLCH_PATTERN.test('oklch(50% 0.15 180)')).toBe(true)
      expect(OKLCH_PATTERN.test('oklch(98.92% 0.0102 81.8)')).toBe(true)
    })

    it('should match oklch with decimal lightness (0-1 range)', () => {
      expect(OKLCH_PATTERN.test('oklch(0.769 0.188 70.08)')).toBe(true)
      expect(OKLCH_PATTERN.test('oklch(0.5 0.15 180)')).toBe(true)
      expect(OKLCH_PATTERN.test('oklch(0.9892 0.0102 81.8)')).toBe(true)
    })

    it('should match oklch with various spacing', () => {
      expect(OKLCH_PATTERN.test('oklch(50% 0.15 180)')).toBe(true)
      expect(OKLCH_PATTERN.test('oklch( 50% 0.15 180 )')).toBe(true)
      expect(OKLCH_PATTERN.test('oklch(  50%   0.15   180  )')).toBe(true)
    })

    it('should match oklch with negative hue values', () => {
      expect(OKLCH_PATTERN.test('oklch(50% 0.15 -30)')).toBe(true)
      expect(OKLCH_PATTERN.test('oklch(50% 0.15 -180.5)')).toBe(true)
    })

    it('should match oklch with decimal values', () => {
      expect(OKLCH_PATTERN.test('oklch(76.9% 0.188 70.08)')).toBe(true)
      expect(OKLCH_PATTERN.test('oklch(98.92% 0.0102 81.8)')).toBe(true)
      expect(OKLCH_PATTERN.test('oklch(14.92% 0.0268 85.77)')).toBe(true)
    })
  })

  describe('invalid formats', () => {
    it('should not match other color formats', () => {
      expect(OKLCH_PATTERN.test('#ff0000')).toBe(false)
      expect(OKLCH_PATTERN.test('rgb(255, 0, 0)')).toBe(false)
      expect(OKLCH_PATTERN.test('hsl(0, 100%, 50%)')).toBe(false)
      expect(OKLCH_PATTERN.test('rgba(255, 0, 0, 0.5)')).toBe(false)
    })

    it('should not match oklab format', () => {
      expect(OKLCH_PATTERN.test('oklab(0.5 0.1 -0.1)')).toBe(false)
    })

    it('should not match incomplete oklch', () => {
      expect(OKLCH_PATTERN.test('oklch(50%)')).toBe(true) // Still matches the pattern, just incomplete
      expect(OKLCH_PATTERN.test('oklch')).toBe(false)
      expect(OKLCH_PATTERN.test('oklch(')).toBe(false)
      expect(OKLCH_PATTERN.test('oklch)')).toBe(false)
    })

    it('should not match with missing parentheses', () => {
      expect(OKLCH_PATTERN.test('oklch 50% 0.15 180')).toBe(false)
    })
  })

  describe('regex properties', () => {
    it('should be a RegExp instance', () => {
      expect(OKLCH_PATTERN).toBeInstanceOf(RegExp)
    })

    it('should match from start to end of string', () => {
      expect(OKLCH_PATTERN.test('prefix oklch(50% 0.15 180)')).toBe(false)
      expect(OKLCH_PATTERN.test('oklch(50% 0.15 180) suffix')).toBe(false)
    })
  })
})
