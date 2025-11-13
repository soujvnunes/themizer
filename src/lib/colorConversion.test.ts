/**
 * Tests for color conversion utilities (OKLCH <-> RGB)
 */

import {
  parseOklch,
  formatOklch,
  oklchToRgb,
  rgbToOklch,
  type OklchColor,
  type RgbColor,
} from './colorConversion'

describe('parseOklch', () => {
  describe('valid formats', () => {
    it('should parse oklch with percentage lightness', () => {
      const result = parseOklch('oklch(76.9% 0.188 70.08)')
      expect(result).toEqual({ l: 76.9, c: 0.188, h: 70.08 })
    })

    it('should parse oklch with decimal lightness (0-1 range)', () => {
      const result = parseOklch('oklch(0.769 0.188 70.08)')
      expect(result).toEqual({ l: 76.9, c: 0.188, h: 70.08 })
    })

    it('should parse oklch with varying whitespace', () => {
      const result = parseOklch('oklch(50%   0.15   180)')
      expect(result).toEqual({ l: 50, c: 0.15, h: 180 })
    })

    it('should handle whole number values', () => {
      const result = parseOklch('oklch(100% 0 0)')
      expect(result).toEqual({ l: 100, c: 0, h: 0 })
    })

    it('should handle negative hue values', () => {
      const result = parseOklch('oklch(50% 0.15 -90)')
      expect(result).toEqual({ l: 50, c: 0.15, h: -90 })
    })

    it('should handle very small chroma values', () => {
      const result = parseOklch('oklch(50% 0.0001 180)')
      expect(result).toEqual({ l: 50, c: 0.0001, h: 180 })
    })

    it('should handle hue values over 360', () => {
      const result = parseOklch('oklch(50% 0.15 720)')
      expect(result).toEqual({ l: 50, c: 0.15, h: 720 })
    })
  })

  describe('invalid formats', () => {
    it('should throw error for invalid format', () => {
      expect(() => parseOklch('rgb(255, 0, 0)')).toThrow('Invalid oklch color format')
    })

    it('should throw error for missing parentheses', () => {
      expect(() => parseOklch('oklch 50% 0.15 180')).toThrow('Invalid oklch color format')
    })

    it('should throw error for wrong number of components', () => {
      expect(() => parseOklch('oklch(50% 0.15)')).toThrow('Invalid oklch color format')
      expect(() => parseOklch('oklch(50%)')).toThrow('Invalid oklch color format')
    })

    it('should throw error for empty string', () => {
      expect(() => parseOklch('')).toThrow('Invalid oklch color format')
    })

    it('should throw error for malformed oklch', () => {
      expect(() => parseOklch('oklch(50%, 0.15, 180)')).toThrow('Invalid oklch color format')
    })
  })
})

describe('formatOklch', () => {
  describe('lightness formatting', () => {
    it('should format whole number lightness without decimals', () => {
      expect(formatOklch(50, 0.15, 180)).toBe('oklch(50% 0.15 180)')
    })

    it('should format decimal lightness with proper precision', () => {
      expect(formatOklch(76.9, 0.188, 70.08)).toBe('oklch(76.9% 0.188 70.08)')
    })

    it('should remove unnecessary trailing zeros from lightness', () => {
      expect(formatOklch(50.1, 0.15, 180)).toBe('oklch(50.1% 0.15 180)')
    })

    it('should handle lightness at boundaries', () => {
      expect(formatOklch(0, 0, 0)).toBe('oklch(0% 0 0)')
      expect(formatOklch(100, 0, 0)).toBe('oklch(100% 0 0)')
    })
  })

  describe('chroma formatting', () => {
    it('should format zero chroma as "0"', () => {
      expect(formatOklch(50, 0, 180)).toBe('oklch(50% 0 180)')
    })

    it('should format small chroma with high precision', () => {
      expect(formatOklch(50, 0.0102, 180)).toBe('oklch(50% 0.0102 180)')
      expect(formatOklch(50, 0.0001, 180)).toBe('oklch(50% 0.0001 180)')
    })

    it('should format large chroma with 3 decimals', () => {
      expect(formatOklch(50, 0.188, 180)).toBe('oklch(50% 0.188 180)')
      expect(formatOklch(50, 0.3, 180)).toBe('oklch(50% 0.30 180)')
    })

    it('should remove trailing zeros from chroma', () => {
      expect(formatOklch(50, 0.1, 180)).toBe('oklch(50% 0.10 180)')
      expect(formatOklch(50, 0.15, 180)).toBe('oklch(50% 0.15 180)')
    })
  })

  describe('hue formatting', () => {
    it('should format whole number hue without decimals', () => {
      expect(formatOklch(50, 0.15, 180)).toBe('oklch(50% 0.15 180)')
      expect(formatOklch(50, 0.15, 0)).toBe('oklch(50% 0.15 0)')
      expect(formatOklch(50, 0.15, 360)).toBe('oklch(50% 0.15 360)')
    })

    it('should format decimal hue with needed precision', () => {
      expect(formatOklch(50, 0.15, 70.08)).toBe('oklch(50% 0.15 70.08)')
      expect(formatOklch(50, 0.15, 180.5)).toBe('oklch(50% 0.15 180.5)')
    })

    it('should remove trailing zeros from hue', () => {
      expect(formatOklch(50, 0.15, 180.1)).toBe('oklch(50% 0.15 180.1)')
    })

    it('should handle negative hue', () => {
      expect(formatOklch(50, 0.15, -90)).toBe('oklch(50% 0.15 -90)')
    })
  })

  describe('real-world examples', () => {
    it('should format amber color correctly', () => {
      expect(formatOklch(76.9, 0.188, 70.08)).toBe('oklch(76.9% 0.188 70.08)')
    })

    it('should format lightest shade correctly', () => {
      expect(formatOklch(98.92, 0.0102, 73.08)).toBe('oklch(98.92% 0.0102 73.08)')
    })

    it('should format darkest shade correctly', () => {
      expect(formatOklch(14.92, 0.0268, 73.08)).toBe('oklch(14.92% 0.0268 73.08)')
    })
  })
})

describe('oklchToRgb', () => {
  describe('basic color conversions', () => {
    it('should convert pure white correctly', () => {
      const result = oklchToRgb(100, 0, 0)
      expect(result).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('should convert pure black correctly', () => {
      const result = oklchToRgb(0, 0, 0)
      expect(result).toEqual({ r: 0, g: 0, b: 0 })
    })

    it('should convert mid gray correctly', () => {
      const result = oklchToRgb(60, 0, 0)
      expect(result.r).toBe(result.g)
      expect(result.g).toBe(result.b)
      expect(result.r).toBeGreaterThan(100)
      expect(result.r).toBeLessThan(160)
    })
  })

  describe('primary colors', () => {
    it('should convert red-ish color', () => {
      const result = oklchToRgb(63, 0.25, 29)
      expect(result.r).toBeGreaterThan(result.g)
      expect(result.r).toBeGreaterThan(result.b)
    })

    it('should convert green-ish color', () => {
      const result = oklchToRgb(87, 0.2, 142)
      expect(result.g).toBeGreaterThan(result.r)
      expect(result.g).toBeGreaterThan(result.b)
    })

    it('should convert blue-ish color', () => {
      const result = oklchToRgb(45, 0.31, 264)
      expect(result.b).toBeGreaterThan(result.r)
      expect(result.b).toBeGreaterThan(result.g)
    })
  })

  describe('real-world colors', () => {
    it('should convert amber color', () => {
      const result = oklchToRgb(76.9, 0.188, 70.08)
      expect(result.r).toBeGreaterThan(200)
      expect(result.g).toBeGreaterThan(100)
      expect(result.g).toBeLessThan(200)
      expect(result.b).toBeLessThan(100)
    })

    it('should handle very light colors', () => {
      const result = oklchToRgb(98.92, 0.0102, 73.08)
      expect(result.r).toBeGreaterThan(240)
      expect(result.g).toBeGreaterThan(240)
      expect(result.b).toBeGreaterThan(240)
    })

    it('should handle very dark colors', () => {
      const result = oklchToRgb(14.92, 0.0268, 73.08)
      expect(result.r).toBeLessThan(50)
      expect(result.g).toBeLessThan(50)
      expect(result.b).toBeLessThan(50)
    })
  })

  describe('edge cases', () => {
    it('should clamp out-of-gamut colors to RGB range', () => {
      const result = oklchToRgb(50, 0.4, 0)
      expect(result.r).toBeLessThanOrEqual(255)
      expect(result.r).toBeGreaterThanOrEqual(0)
      expect(result.g).toBeLessThanOrEqual(255)
      expect(result.g).toBeGreaterThanOrEqual(0)
      expect(result.b).toBeLessThanOrEqual(255)
      expect(result.b).toBeGreaterThanOrEqual(0)
    })

    it('should handle hue at boundaries', () => {
      const result1 = oklchToRgb(50, 0.15, 0)
      const result2 = oklchToRgb(50, 0.15, 360)
      expect(result1).toEqual(result2)
    })

    it('should handle negative hue', () => {
      const result1 = oklchToRgb(50, 0.15, -90)
      const result2 = oklchToRgb(50, 0.15, 270)
      expect(result1).toEqual(result2)
    })
  })
})

describe('rgbToOklch', () => {
  describe('basic color conversions', () => {
    it('should convert pure white correctly', () => {
      const result = rgbToOklch(255, 255, 255)
      expect(result.l).toBeCloseTo(100, 0)
      expect(result.c).toBeCloseTo(0, 2)
    })

    it('should convert pure black correctly', () => {
      const result = rgbToOklch(0, 0, 0)
      expect(result.l).toBeCloseTo(0, 0)
      expect(result.c).toBeCloseTo(0, 2)
    })

    it('should convert gray scale correctly', () => {
      const result = rgbToOklch(128, 128, 128)
      expect(result.c).toBeCloseTo(0, 2)
      expect(result.l).toBeGreaterThan(40)
      expect(result.l).toBeLessThan(70)
    })
  })

  describe('primary colors', () => {
    it('should convert pure red', () => {
      const result = rgbToOklch(255, 0, 0)
      expect(result.l).toBeGreaterThan(60)
      expect(result.l).toBeLessThan(70)
      expect(result.c).toBeGreaterThan(0.2)
      expect(result.h).toBeGreaterThan(20)
      expect(result.h).toBeLessThan(40)
    })

    it('should convert pure green', () => {
      const result = rgbToOklch(0, 255, 0)
      expect(result.l).toBeGreaterThan(80)
      expect(result.l).toBeLessThan(90)
      expect(result.c).toBeGreaterThan(0.2)
      expect(result.h).toBeGreaterThan(130)
      expect(result.h).toBeLessThan(150)
    })

    it('should convert pure blue', () => {
      const result = rgbToOklch(0, 0, 255)
      expect(result.l).toBeGreaterThan(40)
      expect(result.l).toBeLessThan(50)
      expect(result.c).toBeGreaterThan(0.3)
      expect(result.h).toBeGreaterThan(260)
      expect(result.h).toBeLessThan(270)
    })
  })

  describe('real-world colors', () => {
    it('should convert amber-like color', () => {
      const result = rgbToOklch(255, 160, 0)
      expect(result.l).toBeGreaterThan(70)
      expect(result.l).toBeLessThan(85)
      expect(result.c).toBeGreaterThan(0.15)
      expect(result.h).toBeGreaterThan(60)
      expect(result.h).toBeLessThan(80)
    })

    it('should convert pastel colors', () => {
      const result = rgbToOklch(255, 200, 200)
      expect(result.l).toBeGreaterThan(85)
      expect(result.c).toBeLessThan(0.1)
    })

    it('should convert dark colors', () => {
      const result = rgbToOklch(32, 32, 32)
      expect(result.l).toBeLessThan(30)
      expect(result.c).toBeCloseTo(0, 2)
    })
  })

  describe('hue handling', () => {
    it('should produce hue in 0-360 range', () => {
      const colors: [number, number, number][] = [
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255],
        [255, 255, 0],
        [255, 0, 255],
        [0, 255, 255],
      ]

      colors.forEach(([r, g, b]) => {
        const result = rgbToOklch(r, g, b)
        expect(result.h).toBeGreaterThanOrEqual(0)
        expect(result.h).toBeLessThan(360)
      })
    })
  })
})

describe('round-trip conversions', () => {
  const tolerance = 2

  it('should preserve color in OKLCH → RGB → OKLCH conversion', () => {
    const testCases: OklchColor[] = [
      { l: 50, c: 0.15, h: 180 },
      { l: 76.9, c: 0.188, h: 70.08 },
      { l: 98.92, c: 0.0102, h: 73.08 },
      { l: 14.92, c: 0.0268, h: 73.08 },
    ]

    testCases.forEach((original) => {
      const rgb = oklchToRgb(original.l, original.c, original.h)
      const result = rgbToOklch(rgb.r, rgb.g, rgb.b)

      expect(result.l).toBeCloseTo(original.l, -1)
      expect(result.c).toBeCloseTo(original.c, 1)

      if (original.c > 0.01) {
        const hueDiff = Math.abs(result.h - original.h)
        const adjustedDiff = Math.min(hueDiff, 360 - hueDiff)
        expect(adjustedDiff).toBeLessThan(10)
      }
    })
  })

  it('should preserve color in RGB → OKLCH → RGB conversion', () => {
    const testCases: RgbColor[] = [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 },
      { r: 255, g: 160, b: 0 },
      { r: 128, g: 128, b: 128 },
    ]

    testCases.forEach((original) => {
      const oklch = rgbToOklch(original.r, original.g, original.b)
      const result = oklchToRgb(oklch.l, oklch.c, oklch.h)

      expect(Math.abs(result.r - original.r)).toBeLessThanOrEqual(tolerance)
      expect(Math.abs(result.g - original.g)).toBeLessThanOrEqual(tolerance)
      expect(Math.abs(result.b - original.b)).toBeLessThanOrEqual(tolerance)
    })
  })

  it('should handle random colors successfully', () => {
    for (let i = 0; i < 20; i++) {
      const r = Math.floor(Math.random() * 256)
      const g = Math.floor(Math.random() * 256)
      const b = Math.floor(Math.random() * 256)

      const oklch = rgbToOklch(r, g, b)
      const result = oklchToRgb(oklch.l, oklch.c, oklch.h)

      expect(Math.abs(result.r - r)).toBeLessThanOrEqual(tolerance)
      expect(Math.abs(result.g - g)).toBeLessThanOrEqual(tolerance)
      expect(Math.abs(result.b - b)).toBeLessThanOrEqual(tolerance)
    }
  })
})

describe('integration with color expansion', () => {
  it('should work with color shade generation', () => {
    const baseColor = { l: 76.9, c: 0.188, h: 70.08 }
    const lighter = { l: 95, c: baseColor.c * 0.05, h: baseColor.h + 1 }
    const rgb = oklchToRgb(lighter.l, lighter.c, lighter.h)

    expect(rgb.r).toBeGreaterThan(240)
    expect(rgb.g).toBeGreaterThan(230)
    expect(rgb.b).toBeGreaterThan(200)
  })

  it('should maintain color harmony across shades', () => {
    const shades = [
      { l: 98.92, c: 0.0102, h: 73.08 },
      { l: 76.9, c: 0.188, h: 70.08 },
      { l: 14.92, c: 0.0268, h: 73.08 },
    ]

    const rgbShades = shades.map((shade) => oklchToRgb(shade.l, shade.c, shade.h))

    rgbShades.forEach((rgb) => {
      expect(rgb.r).toBeGreaterThanOrEqual(0)
      expect(rgb.r).toBeLessThanOrEqual(255)
      expect(rgb.g).toBeGreaterThanOrEqual(0)
      expect(rgb.g).toBeLessThanOrEqual(255)
      expect(rgb.b).toBeGreaterThanOrEqual(0)
      expect(rgb.b).toBeLessThanOrEqual(255)
    })
    expect(rgbShades[0].r + rgbShades[0].g + rgbShades[0].b).toBeGreaterThan(
      rgbShades[2].r + rgbShades[2].g + rgbShades[2].b
    )
  })
})