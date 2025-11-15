import CSS_IDENTIFIER_REGEX from './CSS_IDENTIFIER_REGEX'

describe('CSS_IDENTIFIER_REGEX', () => {
  describe('valid CSS identifiers', () => {
    it('should match simple identifiers', () => {
      expect(CSS_IDENTIFIER_REGEX.test('primary')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('color')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('theme')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('a')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('Z')).toBe(true)
    })

    it('should match identifiers with hyphens', () => {
      expect(CSS_IDENTIFIER_REGEX.test('primary-color')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('background-dark')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('my-custom-property')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('a-b-c-d')).toBe(true)
    })

    it('should match identifiers with underscores', () => {
      expect(CSS_IDENTIFIER_REGEX.test('primary_color')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('_private')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('__double')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('my_custom_property')).toBe(true)
    })

    it('should match identifiers with numbers', () => {
      expect(CSS_IDENTIFIER_REGEX.test('color1')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('h1')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('500')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('theme2023')).toBe(true)
    })

    it('should match mixed format identifiers', () => {
      expect(CSS_IDENTIFIER_REGEX.test('primary-color_500')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('theme_2023-dark')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('_private-var-123')).toBe(true)
    })
  })

  describe('invalid CSS identifiers', () => {
    it('should not match empty string', () => {
      expect(CSS_IDENTIFIER_REGEX.test('')).toBe(false)
    })

    it('should not match identifiers with spaces', () => {
      expect(CSS_IDENTIFIER_REGEX.test('primary color')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test(' primary')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test('primary ')).toBe(false)
    })

    it('should not match identifiers with special characters', () => {
      expect(CSS_IDENTIFIER_REGEX.test('primary.color')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test('primary:color')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test('primary/color')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test('primary@color')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test('primary#color')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test('primary$color')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test('primary%color')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test('primary&color')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test('primary*color')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test('primary+color')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test('primary=color')).toBe(false)
    })

    it('should not match identifiers with brackets or parentheses', () => {
      expect(CSS_IDENTIFIER_REGEX.test('primary[0]')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test('primary(color)')).toBe(false)
      expect(CSS_IDENTIFIER_REGEX.test('primary{color}')).toBe(false)
    })
  })

  describe('regex properties', () => {
    it('should be a RegExp instance', () => {
      expect(CSS_IDENTIFIER_REGEX).toBeInstanceOf(RegExp)
    })

    it('should match from start to end of string', () => {
      expect(CSS_IDENTIFIER_REGEX.test('valid')).toBe(true)
      expect(CSS_IDENTIFIER_REGEX.test('also_valid')).toBe(true)
      // Should match entire string only
      const match = 'test-identifier'.match(CSS_IDENTIFIER_REGEX)
      expect(match?.[0]).toBe('test-identifier')
    })
  })
})
