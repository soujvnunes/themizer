import { inferSyntax, createPropertyMetadata, isComputationallyIndependent } from './inferSyntax'

describe('inferSyntax', () => {
  describe('color values', () => {
    it('detects oklch colors', () => {
      expect(inferSyntax('oklch(76.9% 0.188 70.08)')).toBe('<color>')
    })

    it('detects oklab colors', () => {
      expect(inferSyntax('oklab(0.769 0.176 0.109)')).toBe('<color>')
    })

    it('detects rgb colors', () => {
      expect(inferSyntax('rgb(255, 0, 0)')).toBe('<color>')
      expect(inferSyntax('rgba(255, 0, 0, 0.5)')).toBe('<color>')
    })

    it('detects hsl colors', () => {
      expect(inferSyntax('hsl(120, 100%, 50%)')).toBe('<color>')
      expect(inferSyntax('hsla(120, 100%, 50%, 0.5)')).toBe('<color>')
    })

    it('detects color-mix function', () => {
      expect(inferSyntax('color-mix(in srgb, red 50%, blue)')).toBe('<color>')
    })

    it('detects hex colors', () => {
      expect(inferSyntax('#f00')).toBe('<color>')
      expect(inferSyntax('#ff0000')).toBe('<color>')
      expect(inferSyntax('#ff0000ff')).toBe('<color>')
    })

    it('detects named colors', () => {
      expect(inferSyntax('transparent')).toBe('<color>')
      expect(inferSyntax('currentColor')).toBe('<color>')
      expect(inferSyntax('black')).toBe('<color>')
      expect(inferSyntax('white')).toBe('<color>')
      expect(inferSyntax('red')).toBe('<color>')
    })
  })

  describe('length values', () => {
    it('detects pixel lengths', () => {
      expect(inferSyntax('16px')).toBe('<length>')
      expect(inferSyntax('24px')).toBe('<length>')
    })

    it('detects rem lengths', () => {
      expect(inferSyntax('1rem')).toBe('<length>')
      expect(inferSyntax('1.5rem')).toBe('<length>')
    })

    it('detects em lengths', () => {
      expect(inferSyntax('2em')).toBe('<length>')
    })

    it('detects viewport units', () => {
      expect(inferSyntax('100vh')).toBe('<length>')
      expect(inferSyntax('50vw')).toBe('<length>')
      expect(inferSyntax('10vmin')).toBe('<length>')
      expect(inferSyntax('10vmax')).toBe('<length>')
    })

    it('detects negative lengths', () => {
      expect(inferSyntax('-16px')).toBe('<length>')
    })

    it('detects decimal lengths', () => {
      expect(inferSyntax('0.5rem')).toBe('<length>')
    })
  })

  describe('percentage values', () => {
    it('detects percentages', () => {
      expect(inferSyntax('100%')).toBe('<percentage>')
      expect(inferSyntax('50%')).toBe('<percentage>')
      expect(inferSyntax('0.5%')).toBe('<percentage>')
    })

    it('detects negative percentages', () => {
      expect(inferSyntax('-50%')).toBe('<percentage>')
    })
  })

  describe('time values', () => {
    it('detects milliseconds', () => {
      expect(inferSyntax('200ms')).toBe('<time>')
      expect(inferSyntax('0ms')).toBe('<time>')
    })

    it('detects seconds', () => {
      expect(inferSyntax('1s')).toBe('<time>')
      expect(inferSyntax('0.5s')).toBe('<time>')
    })
  })

  describe('angle values', () => {
    it('detects degrees', () => {
      expect(inferSyntax('45deg')).toBe('<angle>')
      expect(inferSyntax('90deg')).toBe('<angle>')
    })

    it('detects radians', () => {
      expect(inferSyntax('1.5rad')).toBe('<angle>')
    })

    it('detects gradians', () => {
      expect(inferSyntax('100grad')).toBe('<angle>')
    })

    it('detects turns', () => {
      expect(inferSyntax('0.25turn')).toBe('<angle>')
    })
  })

  describe('number values', () => {
    it('detects integers', () => {
      expect(inferSyntax('0')).toBe('<integer>')
      expect(inferSyntax('1')).toBe('<integer>')
      expect(inferSyntax('100')).toBe('<integer>')
    })

    it('detects negative integers', () => {
      expect(inferSyntax('-1')).toBe('<integer>')
    })

    it('detects decimal numbers', () => {
      expect(inferSyntax('0.5')).toBe('<number>')
      expect(inferSyntax('1.5')).toBe('<number>')
    })

    it('detects negative numbers', () => {
      expect(inferSyntax('-1.5')).toBe('<number>')
    })
  })

  describe('complex or unknown values', () => {
    it('returns universal syntax for complex expressions', () => {
      expect(inferSyntax('cubic-bezier(0.5, -0.5, 0.25, 1.5)')).toBe('*')
    })

    it('returns universal syntax for var() references', () => {
      expect(inferSyntax('var(--color-primary)')).toBe('*')
    })

    it('returns universal syntax for strings', () => {
      expect(inferSyntax('sofia-pro')).toBe('*')
    })

    it('returns universal syntax for empty values', () => {
      expect(inferSyntax('')).toBe('*')
    })
  })
})

describe('isComputationallyIndependent', () => {
  it('returns true for plain values', () => {
    expect(isComputationallyIndependent('16px')).toBe(true)
    expect(isComputationallyIndependent('1rem')).toBe(true)
    expect(isComputationallyIndependent('oklch(76.9% 0.188 70.08)')).toBe(true)
    expect(isComputationallyIndependent('#ff0000')).toBe(true)
    expect(isComputationallyIndependent('100%')).toBe(true)
  })

  it('returns false for var() references', () => {
    expect(isComputationallyIndependent('var(--color)')).toBe(false)
    expect(isComputationallyIndependent('var(--spacing, 1rem)')).toBe(false)
    expect(isComputationallyIndependent('var(--a0, oklch(76.9% 0.188 70.08))')).toBe(false)
  })

  it('returns false for env() references', () => {
    expect(isComputationallyIndependent('env(safe-area-inset-top)')).toBe(false)
  })

  it('returns false for attr() references', () => {
    expect(isComputationallyIndependent('attr(data-value)')).toBe(false)
  })

  it('returns false for values containing var() inside functions', () => {
    expect(isComputationallyIndependent('color-mix(in srgb, var(--color) 50%, white)')).toBe(false)
    expect(isComputationallyIndependent('calc(var(--spacing) * 2)')).toBe(false)
  })
})

describe('createPropertyMetadata', () => {
  it('creates metadata with correct syntax', () => {
    const metadata = createPropertyMetadata('oklch(76.9% 0.188 70.08)')

    expect(metadata).toEqual({
      syntax: '<color>',
      inherits: false,
      initialValue: 'oklch(76.9% 0.188 70.08)',
    })
  })

  it('sets inherits to false', () => {
    const metadata = createPropertyMetadata('16px')

    expect(metadata).not.toBeNull()
    expect(metadata?.inherits).toBe(false)
  })

  it('preserves the original value as initialValue', () => {
    const value = '1rem'
    const metadata = createPropertyMetadata(value)

    expect(metadata).not.toBeNull()
    expect(metadata?.initialValue).toBe(value)
  })

  it('returns null for values with var() references', () => {
    expect(createPropertyMetadata('var(--color)')).toBeNull()
    expect(createPropertyMetadata('var(--spacing, 1rem)')).toBeNull()
    expect(createPropertyMetadata('color-mix(in srgb, var(--color) 50%, white)')).toBeNull()
  })
})
