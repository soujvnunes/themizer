import { expandColor } from './expandColor'

describe('expandColor', () => {
  it('should expand a single oklch color to 7 shades with expected values', () => {
    const result = expandColor('oklch(76.9% 0.188 70.08)')

    // Verify all 7 shades exist
    expect(result).toHaveProperty('lightest')
    expect(result).toHaveProperty('lighter')
    expect(result).toHaveProperty('light')
    expect(result).toHaveProperty('base')
    expect(result).toHaveProperty('dark')
    expect(result).toHaveProperty('darker')
    expect(result).toHaveProperty('darkest')

    // Base should be the original color
    expect(result.base).toBe('oklch(76.9% 0.188 70.08)')

    // All values should be oklch formatted strings
    expect(result.lightest).toMatch(/^oklch\([\d.]+%\s+[\d.]+\s+[\d.]+\)$/)
    expect(result.lighter).toMatch(/^oklch\([\d.]+%\s+[\d.]+\s+[\d.]+\)$/)
    expect(result.light).toMatch(/^oklch\([\d.]+%\s+[\d.]+\s+[\d.]+\)$/)
    expect(result.dark).toMatch(/^oklch\([\d.]+%\s+[\d.]+\s+[\d.]+\)$/)
    expect(result.darker).toMatch(/^oklch\([\d.]+%\s+[\d.]+\s+[\d.]+\)$/)
    expect(result.darkest).toMatch(/^oklch\([\d.]+%\s+[\d.]+\s+[\d.]+\)$/)

    // Verify actual values are reasonable (lighter shades should have higher lightness)
    const parseL = (color: string) => parseFloat(color.match(/oklch\(([\d.]+)%/)?.[1] ?? '0')
    expect(parseL(result.lightest)).toBeGreaterThan(parseL(result.lighter))
    expect(parseL(result.lighter)).toBeGreaterThan(parseL(result.light))
    expect(parseL(result.light)).toBeGreaterThan(76.9)
    expect(76.9).toBeGreaterThan(parseL(result.dark))
    expect(parseL(result.dark)).toBeGreaterThan(parseL(result.darker))
    expect(parseL(result.darker)).toBeGreaterThan(parseL(result.darkest))
  })

  it('should expand amber color to exact expected shades', () => {
    const result = expandColor('oklch(76.9% 0.188 70.08)')

    // Test exact values with new precision
    expect(result.lightest).toBe('oklch(98.92% 0.0102 81.8)')
    expect(result.lighter).toBe('oklch(96.2% 0.059 95.617)')
    expect(result.light).toBe('oklch(82.8% 0.189 84.429)')
    expect(result.base).toBe('oklch(76.9% 0.188 70.08)')
    expect(result.dark).toBe('oklch(66.6% 0.179 58.318)')
    expect(result.darker).toBe('oklch(35% 0.0771 45.635)')
    expect(result.darkest).toBe('oklch(14.92% 0.0268 85.77)')
  })

  it('should expand blue color consistently', () => {
    const result = expandColor('oklch(55% 0.15 240)')

    // Verify structure
    expect(result).toHaveProperty('lightest')
    expect(result).toHaveProperty('lighter')
    expect(result).toHaveProperty('light')
    expect(result).toHaveProperty('base')
    expect(result).toHaveProperty('dark')
    expect(result).toHaveProperty('darker')
    expect(result).toHaveProperty('darkest')

    // Base should be unchanged
    expect(result.base).toBe('oklch(55% 0.15 240)')

    // Test lightness values with new constants
    expect(result.lightest).toMatch(/^oklch\(98\.92%/)
    expect(result.lighter).toMatch(/^oklch\(96\.2%/)
    expect(result.light).toMatch(/^oklch\(60\.9%/) // 55 + 5.9
    expect(result.dark).toMatch(/^oklch\(44\.7%/) // 55 - 10.3
    expect(result.darker).toMatch(/^oklch\(35%/)
    expect(result.darkest).toMatch(/^oklch\(14\.92%/)
  })

  it('should handle very light base colors', () => {
    const result = expandColor('oklch(90% 0.08 60)')

    // Light shade should exceed 95.9 (90 + 5.9)
    const lightMatch = result.light.match(/oklch\(([\d.]+)%/)
    const lightL = parseFloat(lightMatch?.[1] ?? '0')
    expect(lightL).toBeCloseTo(95.9, 1)

    // Dark shade should be 79.7 (90 - 10.3)
    const darkMatch = result.dark.match(/oklch\(([\d.]+)%/)
    const darkL = parseFloat(darkMatch?.[1] ?? '0')
    expect(darkL).toBeCloseTo(79.7, 1)
  })

  it('should handle very dark base colors', () => {
    const result = expandColor('oklch(20% 0.12 180)')

    // Light shade should be 25.9 (20 + 5.9)
    const lightMatch = result.light.match(/oklch\(([\d.]+)%/)
    const lightL = parseFloat(lightMatch?.[1] ?? '0')
    expect(lightL).toBeCloseTo(25.9, 1)

    // Dark shade should be 9.7 (20 - 10.3)
    const darkMatch = result.dark.match(/oklch\(([\d.]+)%/)
    const darkL = parseFloat(darkMatch?.[1] ?? '0')
    expect(darkL).toBeCloseTo(9.7, 1)
  })

  it('should handle low chroma colors', () => {
    const result = expandColor('oklch(50% 0.05 120)')

    // Chroma should be reduced according to factors
    const lighterMatch = result.lighter.match(/oklch\([\d.]+%\s+([\d.]+)/)
    const lighterC = parseFloat(lighterMatch?.[1] ?? '0')
    expect(lighterC).toBeCloseTo(0.05 * 0.314, 3)

    const darkerMatch = result.darker.match(/oklch\([\d.]+%\s+([\d.]+)/)
    const darkerC = parseFloat(darkerMatch?.[1] ?? '0')
    expect(darkerC).toBeCloseTo(0.05 * 0.41, 2)

    // Extremes should have their fixed chroma values
    expect(result.lightest).toMatch(/0\.0102/)
    expect(result.darkest).toMatch(/0\.0268/)
  })

  it('should apply consistent hue shifts', () => {
    const baseHue = 100
    const result = expandColor(`oklch(50% 0.1 ${baseHue})`)

    // Extract hue values
    const getHue = (color: string) => {
      const match = color.match(/oklch\([\d.]+%\s+[\d.]+\s+([\d.]+)/)
      return parseFloat(match?.[1] ?? '0')
    }

    expect(getHue(result.lightest)).toBeCloseTo(baseHue + 11.72, 1)
    expect(getHue(result.lighter)).toBeCloseTo(baseHue + 25.537, 2)
    expect(getHue(result.light)).toBeCloseTo(baseHue + 14.349, 2)
    expect(getHue(result.dark)).toBeCloseTo(baseHue - 11.762, 2)
    expect(getHue(result.darker)).toBeCloseTo(baseHue - 24.445, 2)
    expect(getHue(result.darkest)).toBeCloseTo(baseHue + 15.69, 1)
  })

  it('should create lighter shades closer to white', () => {
    const result = expandColor('oklch(50% 0.15 180)')

    // Parse lightness values (first number in oklch)
    const getLightness = (color: string) => parseFloat(color.match(/oklch\(([\d.]+)%/)?.[1] || '0')

    const baseLightness = getLightness(result.base)
    const lightestLightness = getLightness(result.lightest)
    const lighterLightness = getLightness(result.lighter)
    const lightLightness = getLightness(result.light)

    // Lighter shades should have higher lightness values
    expect(lightestLightness).toBeGreaterThan(lighterLightness)
    expect(lighterLightness).toBeGreaterThan(lightLightness)
    expect(lightLightness).toBeGreaterThan(baseLightness)
  })

  it('should create darker shades closer to black', () => {
    const result = expandColor('oklch(50% 0.15 180)')

    // Parse lightness values
    const getLightness = (color: string) => parseFloat(color.match(/oklch\(([\d.]+)%/)?.[1] || '0')

    const baseLightness = getLightness(result.base)
    const darkLightness = getLightness(result.dark)
    const darkerLightness = getLightness(result.darker)
    const darkestLightness = getLightness(result.darkest)

    // Darker shades should have lower lightness values
    expect(baseLightness).toBeGreaterThan(darkLightness)
    expect(darkLightness).toBeGreaterThan(darkerLightness)
    expect(darkerLightness).toBeGreaterThan(darkestLightness)
  })

  it('should handle oklch with decimal lightness format (0-1 range)', () => {
    const result = expandColor('oklch(0.769 0.188 70.08)')

    expect(result).toHaveProperty('base')
    expect(result.lightest).toMatch(/^oklch\(/)
    expect(result.darkest).toMatch(/^oklch\(/)
  })

  it('should create a smooth gradient from lightest to darkest', () => {
    const result = expandColor('oklch(50% 0.1 120)')

    const getLightness = (color: string) => parseFloat(color.match(/oklch\(([\d.]+)%/)?.[1] || '0')

    const shades = [
      getLightness(result.lightest),
      getLightness(result.lighter),
      getLightness(result.light),
      getLightness(result.base),
      getLightness(result.dark),
      getLightness(result.darker),
      getLightness(result.darkest),
    ]

    // Each shade should be darker than the previous
    for (let i = 1; i < shades.length; i++) {
      expect(shades[i - 1]).toBeGreaterThan(shades[i])
    }
  })
})
