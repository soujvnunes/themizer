/**
 * Tests for error helper functions
 */

import { createError } from './createError'

describe('createError', () => {
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
