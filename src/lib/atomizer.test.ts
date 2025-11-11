import atomizer from './atomizer'

describe('atomizer', () => {
  describe('when providing the atoms parameter', () => {
    it('returns the vars and its reference', () => {
      const atomized = atomizer({
        color: {
          red: {
            500: '#f00',
          },
        },
        opacity: {
          primary: 1,
        },
        bounce: 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
      })

      expect(atomized.vars).toEqual({
        '--a0': '#f00',
        '--a1': 1,
        '--a2': 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
      })
      expect(atomized.ref).toEqual({
        color: {
          red: {
            500: 'var(--a0, #f00)',
          },
        },
        opacity: {
          primary: 'var(--a1, 1)',
        },
        bounce: 'var(--a2, cubic-bezier(0.5, -0.5, 0.25, 1.5))',
      })
      expect(atomized.variableMap).toEqual({
        '--a0': '--color-red-500',
        '--a1': '--opacity-primary',
        '--a2': '--bounce',
      })
    })
    describe('with the prefix option', () => {
      it('returns prefixed generated vars and its reference', () => {
        const atomized = atomizer(
          {
            color: {
              red: {
                500: '#f00',
              },
            },
            opacity: {
              primary: 1,
            },
            bounce: 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
          },
          {
            prefix: 'atoms',
          },
        )

        expect(atomized.vars).toEqual({
          '--atoms0': '#f00',
          '--atoms1': 1,
          '--atoms2': 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
        })
        expect(atomized.ref).toEqual({
          color: {
            red: {
              500: 'var(--atoms0, #f00)',
            },
          },
          opacity: {
            primary: 'var(--atoms1, 1)',
          },
          bounce: 'var(--atoms2, cubic-bezier(0.5, -0.5, 0.25, 1.5))',
        })
        expect(atomized.variableMap).toEqual({
          '--atoms0': '--atoms-color-red-500',
          '--atoms1': '--atoms-opacity-primary',
          '--atoms2': '--atoms-bounce',
        })
      })
    })
    describe('with medias options', () => {
      it('returns vars within each media query and its reference', () => {
        const atomized = atomizer(
          {
            colors: {
              black: '#111',
              gray: [{ print: '#fff' }, '#ddd'],
              white: [{ dark: '#333', printOnDark: '#000' }, '#fff'],
              red: {
                500: [{ print: '#000' }, '#f00'],
              },
            },
            spaces: {
              md: [{ desktop: '1.5rem', tablet: '1.25rem' }, '1rem'],
            },
            font: {
              sans: 'sofia-pro',
              sizes: {
                xl: [{ desktop: '3rem' }, '2rem'],
              },
              weight: {
                500: [{ desktop: 800, tablet: 600 }, 400],
              },
            },
            alphas: {
              primary: [{ dark: 1 }, 0.8],
              secondary: 0.6,
            },
            trans: {
              bounce: [{ motion: '200ms cubic-bezier(0.5, -0.5, 0.25, 1.5)' }],
              ease: [{ motion: '200ms cubic-bezier(0.25, 0.1, 0.25, 1)' }],
            },
          },
          {
            medias: {
              tablet: '(min-width: 512px)',
              desktop: '(min-width: 1024px)',
              dark: '(prefers-color-scheme: dark)',
              motion: '(prefers-reduced-motion: no-preference)',
              print: 'print',
              printOnDark: 'print and (prefers-color-scheme: dark)',
            },
          },
        )

        expect(atomized.vars).toEqual({
          '--a0': '#111',
          '--a1': '#ddd',
          '--a2': '#fff',
          '--a3': '#f00',
          '--a4': '1rem',
          '--a5': 'sofia-pro',
          '--a6': '2rem',
          '--a7': 400,
          '--a8': 0.8,
          '--a9': 0.6,
          '@media (prefers-color-scheme: dark)': {
            '--a2': '#333',
            '--a8': 1,
          },
          '@media print': {
            '--a1': '#fff',
            '--a3': '#000',
          },
          '@media (min-width: 1024px)': {
            '--a4': '1.5rem',
            '--a6': '3rem',
            '--a7': 800,
          },
          '@media (prefers-reduced-motion: no-preference)': {
            '--b0': '200ms cubic-bezier(0.5, -0.5, 0.25, 1.5)',
            '--b1': '200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
          },
          '@media print and (prefers-color-scheme: dark)': {
            '--a2': '#000',
          },
          '@media (min-width: 512px)': {
            '--a4': '1.25rem',
            '--a7': 600,
          },
        })
        expect(atomized.ref).toEqual({
          colors: {
            black: 'var(--a0, #111)',
            gray: 'var(--a1, #ddd)',
            white: 'var(--a2, #fff)',
            red: {
              500: 'var(--a3, #f00)',
            },
          },
          spaces: {
            md: 'var(--a4, 1rem)',
          },
          font: {
            sans: 'var(--a5, sofia-pro)',
            weight: {
              '500': 'var(--a7, 400)',
            },
            sizes: {
              xl: 'var(--a6, 2rem)',
            },
          },
          alphas: {
            primary: 'var(--a8, 0.8)',
            secondary: 'var(--a9, 0.6)',
          },
          trans: {
            bounce: 'var(--b0)',
            ease: 'var(--b1)',
          },
        })
        expect(atomized.variableMap).toEqual({
          '--a0': '--colors-black',
          '--a1': '--colors-gray',
          '--a2': '--colors-white',
          '--a3': '--colors-red-500',
          '--a4': '--spaces-md',
          '--a5': '--font-sans',
          '--a6': '--font-sizes-xl',
          '--a7': '--font-weight-500',
          '--a8': '--alphas-primary',
          '--a9': '--alphas-secondary',
          '--b0': '--trans-bounce',
          '--b1': '--trans-ease',
        })
      })
    })
    describe('with metadata generation', () => {
      it('generates metadata for all properties', () => {
        const atomized = atomizer({
          color: {
            primary: '#f00',
          },
          spacing: {
            md: '1rem',
          },
          opacity: {
            full: '100%',
          },
        })

        expect(atomized.metadata).toEqual({
          '--a0': {
            syntax: '<color>',
            inherits: false,
            initialValue: '#f00',
          },
          '--a1': {
            syntax: '<length>',
            inherits: false,
            initialValue: '1rem',
          },
          '--a2': {
            syntax: '<percentage>',
            inherits: false,
            initialValue: '100%',
          },
        })
      })

      it('generates metadata with prefix', () => {
        const atomized = atomizer(
          {
            color: {
              primary: 'oklch(76.9% 0.188 70.08)',
            },
          },
          {
            prefix: 'tokens',
          },
        )

        expect(atomized.metadata).toEqual({
          '--tokens0': {
            syntax: '<color>',
            inherits: false,
            initialValue: 'oklch(76.9% 0.188 70.08)',
          },
        })
      })

      it('generates metadata for responsive properties using default value', () => {
        const atomized = atomizer(
          {
            spacing: {
              md: [{ desktop: '1.5rem' }, '1rem'],
            },
          },
          {
            medias: {
              desktop: '(min-width: 1024px)',
            },
          },
        )

        expect(atomized.metadata).toEqual({
          '--a0': {
            syntax: '<length>',
            inherits: false,
            initialValue: '1rem',
          },
        })
      })
    })
  })

  describe('color expansion', () => {
    it('expands color string inside colors property to 7 shades', () => {
      const atomized = atomizer({
        colors: {
          amber: 'oklch(76.9% 0.188 70.08)',
        },
      })

      // Should have all 7 shades
      expect(atomized.ref).toHaveProperty('colors')
      expect(atomized.ref.colors).toHaveProperty('amber')
      expect(atomized.ref.colors.amber).toHaveProperty('lightest')
      expect(atomized.ref.colors.amber).toHaveProperty('lighter')
      expect(atomized.ref.colors.amber).toHaveProperty('light')
      expect(atomized.ref.colors.amber).toHaveProperty('base')
      expect(atomized.ref.colors.amber).toHaveProperty('dark')
      expect(atomized.ref.colors.amber).toHaveProperty('darker')
      expect(atomized.ref.colors.amber).toHaveProperty('darkest')

      // Should create variables for all shades
      const varCount = Object.keys(atomized.vars).length
      expect(varCount).toBe(7) // 7 shades
    })

    it('keeps color objects as-is (no expansion)', () => {
      const atomized = atomizer({
        colors: {
          blue: {
            500: '#3b82f6',
            700: '#1d4ed8',
          },
        },
      })

      // Should keep the object structure
      expect(atomized.ref.colors.blue).toHaveProperty('500')
      expect(atomized.ref.colors.blue).toHaveProperty('700')
      expect(atomized.ref.colors.blue).not.toHaveProperty('lightest')

      // Should have 2 variables
      const varCount = Object.keys(atomized.vars).length
      expect(varCount).toBe(2)
    })

    it('does not expand color strings in non-colors properties', () => {
      const atomized = atomizer({
        alphas: {
          subtle: 'oklch(76.9% 0.188 70.08)', // Should NOT expand
        },
      })

      // Should keep as a single value
      expect(atomized.ref.alphas.subtle).toContain('var(')
      expect(atomized.ref.alphas).not.toHaveProperty('lightest')

      // Should have only 1 variable
      const varCount = Object.keys(atomized.vars).length
      expect(varCount).toBe(1)
    })

    it('generates correct metadata for expanded colors', () => {
      const atomized = atomizer({
        colors: {
          primary: 'oklch(50% 0.15 180)',
        },
      })

      // All expanded color variables should have <color> syntax
      Object.values(atomized.metadata).forEach((meta) => {
        expect(meta.syntax).toBe('<color>')
        expect(meta.inherits).toBe(false)
      })
    })
  })

  describe('unit expansion', () => {
    it('expands units config with px values', () => {
      const atomized = atomizer({
        units: {
          px: [0, 4, 64],
        },
      })

      // Should have nested structure
      expect(atomized.ref.units).toHaveProperty('px')
      expect(atomized.ref.units.px).toHaveProperty('0')
      expect(atomized.ref.units.px).toHaveProperty('4')
      expect(atomized.ref.units.px).toHaveProperty('8')
      expect(atomized.ref.units.px).toHaveProperty('16')
      expect(atomized.ref.units.px).toHaveProperty('32')
      expect(atomized.ref.units.px).toHaveProperty('64')

      // Should have 17 variables (0, 4, 8, ..., 64)
      const varCount = Object.keys(atomized.vars).length
      expect(varCount).toBe(17)
    })

    it('expands units config with rem values', () => {
      const atomized = atomizer({
        units: {
          rem: [0, 0.5, 2],
        },
      })

      expect(atomized.ref.units).toHaveProperty('rem')
      expect(atomized.ref.units.rem).toHaveProperty('0')
      expect(atomized.ref.units.rem).toHaveProperty('0.5')
      expect(atomized.ref.units.rem).toHaveProperty('1')
      expect(atomized.ref.units.rem).toHaveProperty('1.5')
      expect(atomized.ref.units.rem).toHaveProperty('2')

      // Should have 5 variables
      const varCount = Object.keys(atomized.vars).length
      expect(varCount).toBe(5)
    })

    it('expands multiple unit types', () => {
      const atomized = atomizer({
        units: {
          px: [0, 4, 16],
          rem: [0, 0.5, 2],
          percentage: [0, 50, 100],
        },
      })

      // Should have all unit types
      expect(atomized.ref.units).toHaveProperty('px')
      expect(atomized.ref.units).toHaveProperty('rem')
      expect(atomized.ref.units).toHaveProperty('percentage')

      // Check specific values
      expect(atomized.ref.units.px).toHaveProperty('0')
      expect(atomized.ref.units.px).toHaveProperty('16')
      expect(atomized.ref.units.rem).toHaveProperty('0')
      expect(atomized.ref.units.rem).toHaveProperty('2')
      expect(atomized.ref.units.percentage).toHaveProperty('0')
      expect(atomized.ref.units.percentage).toHaveProperty('100')

      // Should have 5 px + 5 rem + 3 percentage = 13 variables
      const varCount = Object.keys(atomized.vars).length
      expect(varCount).toBe(13)
    })

    it('generates correct metadata for expanded units', () => {
      const atomized = atomizer({
        units: {
          px: [0, 8, 32],
          percentage: [0, 50, 100],
        },
      })

      // Check metadata for different unit types
      const metadataValues = Object.values(atomized.metadata)

      // Some should have <length> syntax (px)
      const lengthMeta = metadataValues.filter((meta) => meta.syntax === '<length>')
      expect(lengthMeta.length).toBeGreaterThan(0)

      // Some should have <percentage> syntax
      const percentageMeta = metadataValues.filter((meta) => meta.syntax === '<percentage>')
      expect(percentageMeta.length).toBeGreaterThan(0)

      // All should have inherits: false
      metadataValues.forEach((meta) => {
        expect(meta.inherits).toBe(false)
      })
    })
  })

  describe('combined expansion', () => {
    it('handles both color and unit expansion in same atomizer call', () => {
      const atomized = atomizer({
        colors: {
          primary: 'oklch(50% 0.15 180)',
          secondary: {
            500: '#3b82f6',
          },
        },
        units: {
          px: [0, 4, 16],
        },
        alphas: {
          subtle: '0.5',
        },
      })

      // Colors should be expanded
      expect(atomized.ref.colors.primary).toHaveProperty('base')
      expect(atomized.ref.colors.primary).toHaveProperty('lightest')

      // Colors object should be kept as-is
      expect(atomized.ref.colors.secondary).toHaveProperty('500')
      expect(atomized.ref.colors.secondary).not.toHaveProperty('base')

      // Units should be expanded
      expect(atomized.ref.units).toHaveProperty('px')
      expect(atomized.ref.units.px).toHaveProperty('0')
      expect(atomized.ref.units.px).toHaveProperty('4')
      expect(atomized.ref.units.px).toHaveProperty('16')

      // Other properties should work normally
      expect(atomized.ref.alphas.subtle).toContain('var(')

      // Total: 7 (color shades) + 1 (secondary.500) + 5 (units: 0,4,8,12,16) + 1 (alpha) = 14
      const varCount = Object.keys(atomized.vars).length
      expect(varCount).toBe(14)
    })
  })
})
