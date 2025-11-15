import { isPlainObject, validatePlainObject, validateFilePath } from './validators'

describe('CLI validators', () => {
  describe('isPlainObject', () => {
    it('should return true for plain objects', () => {
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject({ key: 'value' })).toBe(true)
      expect(isPlainObject({ nested: { object: true } })).toBe(true)
    })

    it('should return false for null', () => {
      expect(isPlainObject(null)).toBe(false)
    })

    it('should return false for arrays', () => {
      expect(isPlainObject([])).toBe(false)
      expect(isPlainObject([1, 2, 3])).toBe(false)
      expect(isPlainObject([{ key: 'value' }])).toBe(false)
    })

    it('should return false for primitives', () => {
      expect(isPlainObject('string')).toBe(false)
      expect(isPlainObject(123)).toBe(false)
      expect(isPlainObject(true)).toBe(false)
      expect(isPlainObject(undefined)).toBe(false)
    })

    it('should return false for functions', () => {
      expect(
        isPlainObject(() => {
          // Empty function for testing
        }),
      ).toBe(false)
      expect(
        isPlainObject(function () {
          // Empty function for testing
        }),
      ).toBe(false)
    })
  })

  describe('validatePlainObject', () => {
    it('should not throw for plain objects', () => {
      expect(() => validatePlainObject({})).not.toThrow()
      expect(() => validatePlainObject({ key: 'value' })).not.toThrow()
      expect(() => validatePlainObject({ nested: { object: true } })).not.toThrow()
    })

    it('should throw for null', () => {
      expect(() => validatePlainObject(null)).toThrow(
        'Value must be a plain object (not null, array, or primitive)',
      )
    })

    it('should throw for arrays', () => {
      expect(() => validatePlainObject([])).toThrow(
        'Value must be a plain object (not null, array, or primitive)',
      )
      expect(() => validatePlainObject([1, 2, 3])).toThrow(
        'Value must be a plain object (not null, array, or primitive)',
      )
    })

    it('should throw for primitives', () => {
      expect(() => validatePlainObject('string')).toThrow(
        'Value must be a plain object (not null, array, or primitive)',
      )
      expect(() => validatePlainObject(123)).toThrow(
        'Value must be a plain object (not null, array, or primitive)',
      )
      expect(() => validatePlainObject(true)).toThrow(
        'Value must be a plain object (not null, array, or primitive)',
      )
      expect(() => validatePlainObject(undefined)).toThrow(
        'Value must be a plain object (not null, array, or primitive)',
      )
    })
  })

  describe('validateFilePath', () => {
    it('should accept valid file paths', () => {
      expect(() => validateFilePath('/path/to/file.css')).not.toThrow()
      expect(() => validateFilePath('./relative/path.css')).not.toThrow()
      expect(() => validateFilePath('simple.css')).not.toThrow()
      expect(() => validateFilePath('src/app/theme.css')).not.toThrow()
    })

    it('should accept paths with up to 3 parent traversals', () => {
      expect(() => validateFilePath('../file.css')).not.toThrow()
      expect(() => validateFilePath('../../file.css')).not.toThrow()
      expect(() => validateFilePath('../../../file.css')).not.toThrow()
    })

    it('should accept normalized paths that end up in valid location', () => {
      expect(() => validateFilePath('./src/../app/file.css')).not.toThrow()
      expect(() => validateFilePath('src/../../app/file.css')).not.toThrow()
    })

    it('should reject empty paths', () => {
      expect(() => validateFilePath('')).toThrow('File path must be a non-empty string')
    })

    it('should reject non-string values', () => {
      expect(() => validateFilePath(null as unknown as string)).toThrow(
        'File path must be a non-empty string',
      )
      expect(() => validateFilePath(undefined as unknown as string)).toThrow(
        'File path must be a non-empty string',
      )
      expect(() => validateFilePath(123 as unknown as string)).toThrow(
        'File path must be a non-empty string',
      )
    })

    it('should reject paths with null bytes', () => {
      expect(() => validateFilePath('file\0.css')).toThrow('File path cannot contain null bytes')
      expect(() => validateFilePath('path/to/file\0.css')).toThrow(
        'File path cannot contain null bytes',
      )
    })

    it('should reject excessive directory traversal', () => {
      expect(() => validateFilePath('../../../../file.css')).toThrow(
        'File path cannot traverse more than 3 parent directories',
      )
      expect(() => validateFilePath('../../../../../etc/passwd')).toThrow(
        'File path cannot traverse more than 3 parent directories',
      )
    })

    it('should handle paths with both forward and backward slashes', () => {
      expect(() => validateFilePath('src\\app\\file.css')).not.toThrow()
      expect(() => validateFilePath('..\\..\\..\\file.css')).not.toThrow()
      expect(() => validateFilePath('..\\..\\..\\..\\file.css')).toThrow(
        'File path cannot traverse more than 3 parent directories',
      )
    })

    it('should ignore single dots in paths', () => {
      expect(() => validateFilePath('./src/./app/./file.css')).not.toThrow()
      expect(() => validateFilePath('././././file.css')).not.toThrow()
    })

    it('should calculate depth correctly with mixed segments', () => {
      // Goes down into 'a/b/c' (+3) then up 2 levels (-2) = net depth 1, min depth 0
      expect(() => validateFilePath('a/b/c/../../file.css')).not.toThrow()

      // Starts by going up 4 levels = min depth -4, should fail
      expect(() => validateFilePath('../../../../a/b/c/file.css')).toThrow(
        'File path cannot traverse more than 3 parent directories',
      )
    })
  })
})
