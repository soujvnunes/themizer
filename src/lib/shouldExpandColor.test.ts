import { shouldExpandColor } from './shouldExpandColor'

describe('shouldExpandColor', () => {
  it('should return true for oklch color string in palette context', () => {
    expect(shouldExpandColor('oklch(76.9% 0.188 70.08)', 'prefix-palette-')).toBe(true)
    expect(shouldExpandColor('oklch(50% 0.15 180)', 'tokens-palette-')).toBe(true)
  })

  it('should return false for oklch color string outside palette context', () => {
    expect(shouldExpandColor('oklch(76.9% 0.188 70.08)', 'prefix-alphas-')).toBe(false)
    expect(shouldExpandColor('oklch(50% 0.15 180)', 'tokens-units-')).toBe(false)
  })

  it('should return false for oklch color string in colors context (no expansion)', () => {
    expect(shouldExpandColor('oklch(76.9% 0.188 70.08)', 'prefix-colors-')).toBe(false)
    expect(shouldExpandColor('oklch(50% 0.15 180)', 'tokens-colors-')).toBe(false)
  })

  it('should return false for non-oklch color strings in palette context', () => {
    expect(shouldExpandColor('#ff0000', 'prefix-palette-')).toBe(false)
    expect(shouldExpandColor('rgb(255, 0, 0)', 'tokens-palette-')).toBe(false)
    expect(shouldExpandColor('hsl(0, 100%, 50%)', 'tokens-palette-')).toBe(false)
  })

  it('should return false for non-string values in palette context', () => {
    expect(shouldExpandColor(123, 'prefix-palette-')).toBe(false)
    expect(shouldExpandColor({ 500: '#ff0000' }, 'tokens-palette-')).toBe(false)
    expect(shouldExpandColor(['#ff0000'], 'tokens-palette-')).toBe(false)
  })

  it('should handle oklch with different spacing', () => {
    expect(shouldExpandColor('oklch(50% 0.15 180)', 'prefix-palette-')).toBe(true)
    expect(shouldExpandColor('oklch( 50% 0.15 180 )', 'prefix-palette-')).toBe(true)
  })
})
