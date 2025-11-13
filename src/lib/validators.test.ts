import {
  isValidCSSIdentifier,
  validatePrefix,
  validateTokens,
  validatePaletteConfig,
} from './validators'

describe('validators', () => {
  describe('isValidCSSIdentifier', () => {
    it('should accept valid CSS identifiers', () => {
      expect(isValidCSSIdentifier('primary')).toBe(true)
      expect(isValidCSSIdentifier('primary-color')).toBe(true)
      expect(isValidCSSIdentifier('primary_color')).toBe(true)
      expect(isValidCSSIdentifier('_private')).toBe(true)
      expect(isValidCSSIdentifier('-webkit-transition')).toBe(true)
      expect(isValidCSSIdentifier('color1')).toBe(true)
      expect(isValidCSSIdentifier('Color')).toBe(true)
    })

    it('should accept numeric identifiers and strings starting with numbers', () => {
      expect(isValidCSSIdentifier('16')).toBe(true)
      expect(isValidCSSIdentifier('123')).toBe(true)
      expect(isValidCSSIdentifier('123-px')).toBe(true)
      expect(isValidCSSIdentifier('0')).toBe(true)
      expect(isValidCSSIdentifier(16)).toBe(true)
      expect(isValidCSSIdentifier(123)).toBe(true)
      expect(isValidCSSIdentifier(0)).toBe(true)
    })

    it('should reject invalid CSS identifiers', () => {
      expect(isValidCSSIdentifier('')).toBe(false)
      expect(isValidCSSIdentifier('has space')).toBe(false)
      expect(isValidCSSIdentifier('has@special')).toBe(false)
      expect(isValidCSSIdentifier('has.dot')).toBe(false)
      expect(isValidCSSIdentifier('has#hash')).toBe(false)
    })

    it('should reject null and undefined', () => {
      expect(isValidCSSIdentifier(null as unknown as string)).toBe(false)
      expect(isValidCSSIdentifier(undefined as unknown as string)).toBe(false)
    })

    it('should reject very long identifiers', () => {
      const longString = 'a'.repeat(256)
      expect(isValidCSSIdentifier(longString)).toBe(false)
    })
  })

  describe('validatePrefix', () => {
    it('should accept valid prefixes', () => {
      expect(() => validatePrefix('theme')).not.toThrow()
      expect(() => validatePrefix('my-prefix')).not.toThrow()
      expect(() => validatePrefix('_prefix')).not.toThrow()
      expect(() => validatePrefix('16')).not.toThrow()
      expect(() => validatePrefix('123px')).not.toThrow()
    })

    it('should throw for invalid prefixes', () => {
      expect(() => validatePrefix('')).toThrow('Prefix cannot be empty')
      expect(() => validatePrefix('has space')).toThrow('Invalid CSS identifier')
      expect(() => validatePrefix('has@special')).toThrow('Invalid CSS identifier')
    })
  })

  describe('validateTokens', () => {
    it('should accept valid token objects', () => {
      expect(() =>
        validateTokens({
          primary: '#ff0000',
          secondary: '#00ff00',
        }),
      ).not.toThrow()

      expect(() =>
        validateTokens({
          colors: {
            primary: '#ff0000',
            secondary: '#00ff00',
          },
        }),
      ).not.toThrow()
    })

    it('should accept responsive token arrays', () => {
      expect(() =>
        validateTokens({
          spacing: ['8px', { sm: '16px', md: '24px' }],
        }),
      ).not.toThrow()
    })

    it('should accept numeric token keys', () => {
      expect(() =>
        validateTokens({
          spacing: {
            16: '16px',
            24: '24px',
            32: '32px',
          },
        }),
      ).not.toThrow()

      expect(() =>
        validateTokens({
          breakpoints: {
            sm: '640px',
            768: '768px',
            lg: '1024px',
          },
        }),
      ).not.toThrow()
    })

    it('should reject invalid token keys', () => {
      expect(() =>
        validateTokens({
          'invalid key': 'value',
        }),
      ).toThrow('Invalid token key')

      expect(() =>
        validateTokens({
          'has@special': 'value',
        }),
      ).toThrow('Invalid token key')
    })

    it('should validate nested objects', () => {
      expect(() =>
        validateTokens({
          colors: {
            'invalid-nested': 'value',
            'has space': 'value',
          },
        }),
      ).toThrow('Invalid token key')
    })

    it('should provide helpful error paths', () => {
      try {
        validateTokens({
          theme: {
            colors: {
              'invalid key': 'value',
            },
          },
        })
        fail('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain('theme.colors.invalid key')
      }
    })
  })

  describe('validatePaletteConfig', () => {
    it('should accept valid palette configurations with OKLCH colors', () => {
      expect(() =>
        validatePaletteConfig({
          amber: 'oklch(76.9% 0.188 70.08)',
          blue: 'oklch(50% 0.15 180)',
        }),
      ).not.toThrow()

      expect(() =>
        validatePaletteConfig({
          primary: 'oklch(50% 0.15 180)',
        }),
      ).not.toThrow()
    })

    it('should accept undefined (optional palette)', () => {
      expect(() => validatePaletteConfig(undefined)).not.toThrow()
    })

    it('should reject non-OKLCH color strings', () => {
      expect(() =>
        validatePaletteConfig({
          amber: '#ff0000',
        }),
      ).toThrow('is not a valid OKLCH color')

      expect(() =>
        validatePaletteConfig({
          blue: 'rgb(0, 0, 255)',
        }),
      ).toThrow('is not a valid OKLCH color')

      expect(() =>
        validatePaletteConfig({
          green: 'hsl(120, 100%, 50%)',
        }),
      ).toThrow('is not a valid OKLCH color')
    })

    it('should reject nested objects', () => {
      expect(() =>
        validatePaletteConfig({
          amber: {
            500: 'oklch(76.9% 0.188 70.08)',
          },
        }),
      ).toThrow('expected OKLCH color string, got object')
    })

    it('should reject non-string values', () => {
      expect(() =>
        validatePaletteConfig({
          amber: 123,
        }),
      ).toThrow('expected OKLCH color string, got number')

      expect(() =>
        validatePaletteConfig({
          blue: ['oklch(50% 0.15 180)'],
        }),
      ).toThrow('expected OKLCH color string, got object')
    })

    it('should reject non-object inputs', () => {
      expect(() => validatePaletteConfig('oklch(50% 0.15 180)')).toThrow(
        'must be an object with color names as keys',
      )

      expect(() => validatePaletteConfig(['oklch(50% 0.15 180)'])).toThrow(
        'must be an object with color names as keys',
      )

      expect(() => validatePaletteConfig(123)).toThrow('must be an object with color names as keys')
    })

    it('should provide helpful error paths', () => {
      try {
        validatePaletteConfig({
          amber: '#ff0000',
        })
        fail('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain('palette.amber')
        expect((error as Error).message).toContain('Expected format: "oklch(L% C H)"')
      }
    })
  })
})
