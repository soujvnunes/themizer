import { expandUnits } from './expandUnits'

describe('expandUnits', () => {
  it('should expand a units config with px values', () => {
    const result = expandUnits({
      px: [0, 4, 16],
    })

    expect(result).toEqual({
      px: {
        0: '0px',
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
      },
    })
  })

  it('should expand a units config with rem values', () => {
    const result = expandUnits({
      rem: [0, 0.5, 4],
    })

    expect(result).toEqual({
      rem: {
        0: '0rem',
        0.5: '0.5rem',
        1: '1rem',
        1.5: '1.5rem',
        2: '2rem',
        2.5: '2.5rem',
        3: '3rem',
        3.5: '3.5rem',
        4: '4rem',
      },
    })
  })

  it('should expand multiple unit types in one config', () => {
    const result = expandUnits({
      px: [0, 4, 16],
      rem: [0, 0.25, 1],
      em: [0, 1, 3],
    })

    expect(result).toHaveProperty('px')
    expect(result).toHaveProperty('rem')
    expect(result).toHaveProperty('em')

    expect(result.px).toEqual({
      0: '0px',
      4: '4px',
      8: '8px',
      12: '12px',
      16: '16px',
    })

    expect(result.rem).toEqual({
      0: '0rem',
      0.25: '0.25rem',
      0.5: '0.5rem',
      0.75: '0.75rem',
      1: '1rem',
    })

    expect(result.em).toEqual({
      0: '0em',
      1: '1em',
      2: '2em',
      3: '3em',
    })
  })

  it('should handle percentage units', () => {
    const result = expandUnits({
      percentage: [0, 25, 100],
    })

    expect(result).toEqual({
      percentage: {
        0: '0%',
        25: '25%',
        50: '50%',
        75: '75%',
        100: '100%',
      },
    })
  })

  it('should handle viewport units (vh, vw, vmin, vmax)', () => {
    const result = expandUnits({
      vh: [0, 50, 100],
      vw: [0, 20, 60],
      vmin: [0, 10, 20],
      vmax: [0, 25, 50],
    })

    expect(result.vh).toEqual({
      0: '0vh',
      50: '50vh',
      100: '100vh',
    })

    expect(result.vw).toEqual({
      0: '0vw',
      20: '20vw',
      40: '40vw',
      60: '60vw',
    })

    expect(result.vmin).toEqual({
      0: '0vmin',
      10: '10vmin',
      20: '20vmin',
    })

    expect(result.vmax).toEqual({
      0: '0vmax',
      25: '25vmax',
      50: '50vmax',
    })
  })

  it('should handle ch and ex units', () => {
    const result = expandUnits({
      ch: [0, 2, 8],
      ex: [0, 0.5, 2],
    })

    expect(result.ch).toEqual({
      0: '0ch',
      2: '2ch',
      4: '4ch',
      6: '6ch',
      8: '8ch',
    })

    expect(result.ex).toEqual({
      0: '0ex',
      0.5: '0.5ex',
      1: '1ex',
      1.5: '1.5ex',
      2: '2ex',
    })
  })

  it('should throw error for invalid unit type', () => {
    expect(() => {
      expandUnits({
        // @ts-expect-error - testing invalid unit type
        invalid: [0, 1, 2],
      })
    }).toThrow(/Unknown unit type: invalid/)
  })

  it('should throw error if step is not positive', () => {
    expect(() => {
      expandUnits({
        px: [0, 0, 16],
      })
    }).toThrow(/Step must be positive/)

    expect(() => {
      expandUnits({
        rem: [0, -0.5, 4],
      })
    }).toThrow(/Step must be positive/)
  })

  it('should throw error if from is greater than to', () => {
    expect(() => {
      expandUnits({
        px: [16, 4, 0],
      })
    }).toThrow(/From \(16\) must be less than or equal to To \(0\)/)
  })

  it('should handle decimal step values correctly', () => {
    const result = expandUnits({
      px: [0, 1.5, 6],
    })

    expect(result.px).toEqual({
      0: '0px',
      1.5: '1.5px',
      3: '3px',
      4.5: '4.5px',
      6: '6px',
    })
  })

  it('should maintain numeric precision for keys', () => {
    const result = expandUnits({
      rem: [0, 0.25, 1],
    })

    const keys = Object.keys(result.rem)
    expect(keys).toContain('0')
    expect(keys).toContain('0.25')
    expect(keys).toContain('0.5')
    expect(keys).toContain('0.75')
    expect(keys).toContain('1')
  })

  it('should handle empty config', () => {
    const result = expandUnits({})
    expect(result).toEqual({})
  })

  it('should work with a single unit type', () => {
    const result = expandUnits({
      em: [1, 1, 3],
    })

    expect(Object.keys(result)).toHaveLength(1)
    expect(result.em).toEqual({
      1: '1em',
      2: '2em',
      3: '3em',
    })
  })

  it('should handle large ranges efficiently', () => {
    const result = expandUnits({
      px: [0, 4, 256],
    })

    expect(Object.keys(result.px)).toHaveLength(65) // 0, 4, 8, ..., 256
    expect(result.px[0]).toBe('0px')
    expect(result.px[128]).toBe('128px')
    expect(result.px[256]).toBe('256px')
  })

  it('should handle floating point precision correctly', () => {
    const result = expandUnits({
      rem: [0, 0.1, 1],
    })

    // Should have 11 values: 0, 0.1, 0.2, ..., 1.0
    expect(Object.keys(result.rem)).toHaveLength(11)

    // Check specific values to ensure no floating point errors
    expect(result.rem[0.3]).toBe('0.3rem')
    expect(result.rem[0.7]).toBe('0.7rem')
    expect(result.rem[1]).toBe('1rem')
  })
})