import {
  isValidCSSIdentifier,
  validatePrefix,
  sanitizeCSSValue,
  isValidMediaQuery,
  validateMediaQuery,
  validateFilePath,
  validateTokens,
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
      // Numeric object keys like { 16: '16px' } become string "16"
      expect(isValidCSSIdentifier('16')).toBe(true)
      expect(isValidCSSIdentifier('123')).toBe(true)
      expect(isValidCSSIdentifier('123-px')).toBe(true)
      expect(isValidCSSIdentifier('0')).toBe(true)
      // Also accept actual numbers (will be converted to strings)
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

  describe('sanitizeCSSValue', () => {
    it('should pass through numbers', () => {
      expect(sanitizeCSSValue(42)).toBe('42')
      expect(sanitizeCSSValue(3.14)).toBe('3.14')
    })

    it('should pass through safe CSS values', () => {
      expect(sanitizeCSSValue('red')).toBe('red')
      expect(sanitizeCSSValue('#ff0000')).toBe('#ff0000')
      expect(sanitizeCSSValue('10px')).toBe('10px')
      expect(sanitizeCSSValue('calc(100% - 20px)')).toBe('calc(100% - 20px)')
      expect(sanitizeCSSValue('var(--spacing)')).toBe('var(--spacing)')
    })

    it('should remove dangerous characters', () => {
      expect(sanitizeCSSValue('<script>alert(1)</script>')).toBe('scriptalert(1)/script')
      expect(sanitizeCSSValue('value{}')).toBe('value')
      expect(sanitizeCSSValue('value<>')).toBe('value')
    })

    it('should remove javascript protocol', () => {
      expect(sanitizeCSSValue('javascript:alert(1)')).toBe('alert(1)')
      expect(sanitizeCSSValue('JavaScript:alert(1)')).toBe('alert(1)')
    })

    it('should remove event handlers', () => {
      expect(sanitizeCSSValue('value onclick=alert')).toBe('value alert')
      expect(sanitizeCSSValue('value onmouseover=evil')).toBe('value evil')
    })

    it('should trim whitespace', () => {
      expect(sanitizeCSSValue('  spaced  ')).toBe('spaced')
    })
  })

  describe('isValidMediaQuery', () => {
    it('should accept valid media queries', () => {
      expect(isValidMediaQuery('(min-width: 768px)')).toBe(true)
      expect(isValidMediaQuery('(max-width: 1024px)')).toBe(true)
      expect(isValidMediaQuery('(prefers-color-scheme: dark)')).toBe(true)
      expect(isValidMediaQuery('screen and (min-width: 768px)')).toBe(true)
      expect(isValidMediaQuery('(min-width: 768px) and (max-width: 1024px)')).toBe(true)
    })

    it('should reject invalid media queries', () => {
      expect(isValidMediaQuery('')).toBe(false)
      expect(isValidMediaQuery('invalid')).toBe(false)
      expect(isValidMediaQuery('()')).toBe(false)
    })

    it('should reject non-string values', () => {
      expect(isValidMediaQuery(null as unknown as string)).toBe(false)
      expect(isValidMediaQuery(undefined as unknown as string)).toBe(false)
    })
  })

  describe('validateMediaQuery', () => {
    it('should accept valid media queries', () => {
      expect(() => validateMediaQuery('(min-width: 768px)')).not.toThrow()
      expect(() => validateMediaQuery('screen and (min-width: 768px)')).not.toThrow()
    })

    it('should throw for invalid media queries', () => {
      expect(() => validateMediaQuery('')).toThrow('Media query cannot be empty')
      expect(() => validateMediaQuery('invalid')).toThrow('Invalid media query syntax')
    })
  })

  describe('validateFilePath', () => {
    it('should accept valid file paths', () => {
      expect(() => validateFilePath('/path/to/file.css')).not.toThrow()
      expect(() => validateFilePath('./relative/path.css')).not.toThrow()
      expect(() => validateFilePath('simple.css')).not.toThrow()
    })

    it('should reject empty paths', () => {
      expect(() => validateFilePath('')).toThrow('File path must be a non-empty string')
    })

    it('should reject directory traversal', () => {
      expect(() => validateFilePath('../../../etc/passwd')).toThrow('directory traversal')
      expect(() => validateFilePath('valid/../../../bad')).toThrow('directory traversal')
    })

    it('should reject null bytes', () => {
      expect(() => validateFilePath('file\0.css')).toThrow('null bytes')
    })

    it('should reject non-string values', () => {
      expect(() => validateFilePath(null as unknown as string)).toThrow()
      expect(() => validateFilePath(undefined as unknown as string)).toThrow()
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
            768: '768px', // Numeric key
            lg: '1024px',
          },
        }),
      ).not.toThrow()
    })

    it('should reject invalid token keys', () => {
      expect(() =>
        validateTokens({
          'invalid key': 'value', // Has space
        }),
      ).toThrow('Invalid token key')

      expect(() =>
        validateTokens({
          'has@special': 'value', // Has special character
        }),
      ).toThrow('Invalid token key')
    })

    it('should validate nested objects', () => {
      expect(() =>
        validateTokens({
          colors: {
            'invalid-nested': 'value', // This is valid
            'has space': 'value', // This is not
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
})
