/**
 * Tests for error helper functions
 */

import { createError } from './createError'

describe('createError', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    jest.restoreAllMocks()
  })

  describe('in production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    it('throws error with context and prefix', () => {
      expect(() => createError('validation', 'Invalid prefix')).toThrow(
        'themizer [validation]: Invalid prefix',
      )
    })

    it('handles different contexts', () => {
      expect(() => createError('expansion', 'Step must be positive')).toThrow(
        'themizer [expansion]: Step must be positive',
      )

      expect(() => createError('color', 'Invalid oklch format')).toThrow(
        'themizer [color]: Invalid oklch format',
      )
    })

    it('handles empty context and message', () => {
      expect(() => createError('', 'Error')).toThrow('themizer []: Error')
      expect(() => createError('context', '')).toThrow('themizer [context]: ')
    })
  })

  describe('in development mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('logs error to console instead of throwing', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => createError('validation', 'Invalid prefix')).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('themizer [validation]: Invalid prefix')
    })

    it('logs different contexts', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      createError('expansion', 'Step must be positive')
      expect(consoleSpy).toHaveBeenCalledWith('themizer [expansion]: Step must be positive')

      createError('color', 'Invalid oklch format')
      expect(consoleSpy).toHaveBeenCalledWith('themizer [color]: Invalid oklch format')
    })
  })
})
