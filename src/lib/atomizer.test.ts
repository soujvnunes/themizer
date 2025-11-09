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
})
