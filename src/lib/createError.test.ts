/**
 * Tests for error helper functions
 */

import { createError, createContextError } from './createError'

describe('createError', () => {
  it('throws error with themizer prefix', () => {
    expect(() => createError('Something went wrong')).toThrow('themizer: Something went wrong')
  })

  it('preserves original message', () => {
    const message = 'Invalid configuration provided'
    expect(() => createError(message)).toThrow(`themizer: ${message}`)
  })

  it('handles empty message', () => {
    expect(() => createError('')).toThrow('themizer: ')
  })
})

describe('createContextError', () => {
  it('throws error with context and prefix', () => {
    expect(() => createContextError('validation', 'Invalid prefix')).toThrow(
      'themizer [validation]: Invalid prefix',
    )
  })

  it('handles different contexts', () => {
    expect(() => createContextError('expansion', 'Step must be positive')).toThrow(
      'themizer [expansion]: Step must be positive',
    )

    expect(() => createContextError('color', 'Invalid oklch format')).toThrow(
      'themizer [color]: Invalid oklch format',
    )
  })

  it('handles empty context and message', () => {
    expect(() => createContextError('', 'Error')).toThrow('themizer []: Error')
    expect(() => createContextError('context', '')).toThrow('themizer [context]: ')
  })
})