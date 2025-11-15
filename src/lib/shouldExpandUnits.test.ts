import { shouldExpandUnits } from './shouldExpandUnits'

describe('shouldExpandUnits', () => {
  it('should return true for valid units config with "units" key', () => {
    expect(
      shouldExpandUnits(
        {
          px: [0, 4, 64],
          rem: [0, 0.5, 4],
        },
        'units',
      ),
    ).toBe(true)

    expect(
      shouldExpandUnits(
        {
          percentage: [0, 25, 100],
        },
        'units',
      ),
    ).toBe(true)

    expect(
      shouldExpandUnits(
        {
          vh: [0, 50, 100],
          vw: [0, 50, 100],
        },
        'units',
      ),
    ).toBe(true)
  })

  it('should return false for valid units config with non-"units" key', () => {
    expect(
      shouldExpandUnits(
        {
          px: [0, 4, 64],
        },
        'spacing',
      ),
    ).toBe(false)

    expect(
      shouldExpandUnits(
        {
          rem: [0, 0.5, 4],
        },
        'sizes',
      ),
    ).toBe(false)
  })

  it('should return false for non-object values with "units" key', () => {
    expect(shouldExpandUnits(['0px', '4px', '64px'], 'units')).toBe(false)
    expect(shouldExpandUnits('1rem', 'units')).toBe(false)
    expect(shouldExpandUnits(123, 'units')).toBe(false)
    expect(shouldExpandUnits(null, 'units')).toBe(false)
    expect(shouldExpandUnits(undefined, 'units')).toBe(false)
  })

  it('should return false for invalid unit types', () => {
    expect(
      shouldExpandUnits(
        {
          invalid: [0, 4, 64], // 'invalid' is not a valid CSS unit type
        },
        'units',
      ),
    ).toBe(false)

    expect(
      shouldExpandUnits(
        {
          px: [0, 4, 64],
          fake: [0, 1, 2], // 'fake' is not a valid CSS unit type
        },
        'units',
      ),
    ).toBe(false)
  })

  it('should return false for invalid tuple formats', () => {
    // Wrong length
    expect(
      shouldExpandUnits(
        {
          px: [0, 4], // Only 2 elements instead of 3
        },
        'units',
      ),
    ).toBe(false)

    expect(
      shouldExpandUnits(
        {
          px: [0, 4, 64, 128], // 4 elements instead of 3
        },
        'units',
      ),
    ).toBe(false)

    // Not all numbers
    expect(
      shouldExpandUnits(
        {
          px: ['0px', '4px', '64px'], // Strings instead of numbers
        },
        'units',
      ),
    ).toBe(false)

    expect(
      shouldExpandUnits(
        {
          rem: [0, '0.5', 4], // Mixed types
        },
        'units',
      ),
    ).toBe(false)
  })

  it('should work with all valid CSS unit types', () => {
    const validUnits = {
      rem: [0, 0.5, 4],
      em: [0, 0.5, 4],
      px: [0, 4, 64],
      percentage: [0, 25, 100],
      vh: [0, 50, 100],
      vw: [0, 50, 100],
      vmin: [0, 50, 100],
      vmax: [0, 50, 100],
      ch: [0, 2, 8],
      ex: [0, 0.5, 2],
    }

    expect(shouldExpandUnits(validUnits, 'units')).toBe(true)
  })

  it('should work with numeric keys', () => {
    expect(
      shouldExpandUnits(
        {
          px: [0, 4, 64],
        },
        0,
      ),
    ).toBe(false) // Key must be 'units'

    expect(
      shouldExpandUnits(
        {
          px: [0, 4, 64],
        },
        123,
      ),
    ).toBe(false) // Key must be 'units'
  })

  it('should handle empty object', () => {
    expect(shouldExpandUnits({}, 'units')).toBe(true) // Empty config is valid
  })

  it('should validate each unit config independently', () => {
    expect(
      shouldExpandUnits(
        {
          px: [0, 4, 64], // Valid
          rem: [0, 0.5], // Invalid - only 2 elements
        },
        'units',
      ),
    ).toBe(false) // Should fail because rem is invalid
  })
})
