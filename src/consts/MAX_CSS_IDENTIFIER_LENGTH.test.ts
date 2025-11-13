import MAX_CSS_IDENTIFIER_LENGTH from './MAX_CSS_IDENTIFIER_LENGTH'

describe('MAX_CSS_IDENTIFIER_LENGTH', () => {
  describe('value properties', () => {
    it('should be a number', () => {
      expect(typeof MAX_CSS_IDENTIFIER_LENGTH).toBe('number')
    })

    it('should be 255', () => {
      expect(MAX_CSS_IDENTIFIER_LENGTH).toBe(255)
    })

    it('should be a positive integer', () => {
      expect(MAX_CSS_IDENTIFIER_LENGTH).toBeGreaterThan(0)
      expect(Number.isInteger(MAX_CSS_IDENTIFIER_LENGTH)).toBe(true)
    })
  })

  describe('usage context', () => {
    it('should be reasonable for CSS custom property names', () => {
      // Most CSS identifiers are much shorter than 255 characters
      expect(MAX_CSS_IDENTIFIER_LENGTH).toBeGreaterThan(50)
      expect(MAX_CSS_IDENTIFIER_LENGTH).toBeLessThan(1000)
    })

    it('should allow for long prefixed property names', () => {
      const longPrefix = 'my-very-long-application-prefix'
      const propertyName = 'deeply-nested-component-property-name'
      const combined = `${longPrefix}-${propertyName}`
      expect(combined.length).toBeLessThan(MAX_CSS_IDENTIFIER_LENGTH)
    })

    it('should be suitable for validation', () => {
      const shortIdentifier = 'color'
      const mediumIdentifier = 'primary-background-color-dark-mode'
      const longIdentifier = 'a'.repeat(200)
      const tooLongIdentifier = 'a'.repeat(256)

      expect(shortIdentifier.length).toBeLessThanOrEqual(MAX_CSS_IDENTIFIER_LENGTH)
      expect(mediumIdentifier.length).toBeLessThanOrEqual(MAX_CSS_IDENTIFIER_LENGTH)
      expect(longIdentifier.length).toBeLessThanOrEqual(MAX_CSS_IDENTIFIER_LENGTH)
      expect(tooLongIdentifier.length).toBeGreaterThan(MAX_CSS_IDENTIFIER_LENGTH)
    })
  })

  describe('browser compatibility', () => {
    it('should align with common browser limits', () => {
      // Most browsers support CSS custom property names up to at least 255 characters
      // This is a reasonable limit that works across all major browsers
      expect(MAX_CSS_IDENTIFIER_LENGTH).toBe(255)
    })
  })
})
