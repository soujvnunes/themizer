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
        '--color-red-500': '#f00',
        '--opacity-primary': 1,
        '--bounce': 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
      })
      expect(atomized.ref).toEqual({
        color: {
          red: {
            500: 'var(--color-red-500, #f00)',
          },
        },
        opacity: {
          primary: 'var(--opacity-primary, 1)',
        },
        bounce: 'var(--bounce, cubic-bezier(0.5, -0.5, 0.25, 1.5))',
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
          '--atoms-color-red-500': '#f00',
          '--atoms-opacity-primary': 1,
          '--atoms-bounce': 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
        })
        expect(atomized.ref).toEqual({
          color: {
            red: {
              500: 'var(--atoms-color-red-500, #f00)',
            },
          },
          opacity: {
            primary: 'var(--atoms-opacity-primary, 1)',
          },
          bounce: 'var(--atoms-bounce, cubic-bezier(0.5, -0.5, 0.25, 1.5))',
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
          '--colors-black': '#111',
          '--colors-gray': '#ddd',
          '--colors-white': '#fff',
          '--colors-red-500': '#f00',
          '--spaces-md': '1rem',
          '--font-sizes-xl': '2rem',
          '--font-sans': 'sofia-pro',
          '--font-weight-500': 400,
          '--alphas-primary': 0.8,
          '--alphas-secondary': 0.6,
          '@media (prefers-color-scheme: dark)': {
            '--colors-white': '#333',
            '--alphas-primary': 1,
          },
          '@media print': {
            '--colors-gray': '#fff',
            '--colors-red-500': '#000',
          },
          '@media (min-width: 1024px)': {
            '--spaces-md': '1.5rem',
            '--font-sizes-xl': '3rem',
            '--font-weight-500': 800,
          },
          '@media (prefers-reduced-motion: no-preference)': {
            '--trans-bounce': '200ms cubic-bezier(0.5, -0.5, 0.25, 1.5)',
            '--trans-ease': '200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
          },
          '@media print and (prefers-color-scheme: dark)': {
            '--colors-white': '#000',
          },
          '@media (min-width: 512px)': {
            '--spaces-md': '1.25rem',
            '--font-weight-500': 600,
          },
        })
        expect(atomized.ref).toEqual({
          colors: {
            black: 'var(--colors-black, #111)',
            gray: 'var(--colors-gray, #ddd)',
            white: 'var(--colors-white, #fff)',
            red: {
              500: 'var(--colors-red-500, #f00)',
            },
          },
          spaces: {
            md: 'var(--spaces-md, 1rem)',
          },
          font: {
            sans: 'var(--font-sans, sofia-pro)',
            weight: {
              '500': 'var(--font-weight-500, 400)',
            },
            sizes: {
              xl: 'var(--font-sizes-xl, 2rem)',
            },
          },
          alphas: {
            primary: 'var(--alphas-primary, 0.8)',
            secondary: 'var(--alphas-secondary, 0.6)',
          },
          trans: {
            bounce: 'var(--trans-bounce)',
            ease: 'var(--trans-ease)',
          },
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
          '--color-primary': {
            syntax: '<color>',
            inherits: false,
            initialValue: '#f00',
          },
          '--spacing-md': {
            syntax: '<length>',
            inherits: false,
            initialValue: '1rem',
          },
          '--opacity-full': {
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
          '--tokens-color-primary': {
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
          '--spacing-md': {
            syntax: '<length>',
            inherits: false,
            initialValue: '1rem',
          },
        })
      })
    })
    describe('with overrides option', () => {
      it('excludes overridden properties from metadata', () => {
        const atomized = atomizer(
          {
            color: {
              primary: '#f00',
              secondary: '#00f',
            },
            spacing: {
              md: '1rem',
            },
          },
          {
            overrides: ['color-primary'],
          },
        )

        expect(atomized.metadata).toEqual({
          '--color-secondary': {
            syntax: '<color>',
            inherits: false,
            initialValue: '#00f',
          },
          '--spacing-md': {
            syntax: '<length>',
            inherits: false,
            initialValue: '1rem',
          },
        })
        expect(atomized.metadata['--color-primary']).toBeUndefined()
      })

      it('excludes nested overridden properties from metadata', () => {
        const atomized = atomizer(
          {
            colors: {
              red: {
                500: '#f00',
                600: '#e00',
              },
            },
          },
          {
            overrides: ['colors-red-500'],
          },
        )

        expect(atomized.metadata).toEqual({
          '--colors-red-600': {
            syntax: '<color>',
            inherits: false,
            initialValue: '#e00',
          },
        })
        expect(atomized.metadata['--colors-red-500']).toBeUndefined()
      })

      it('still generates vars for overridden properties', () => {
        const atomized = atomizer(
          {
            color: {
              primary: '#f00',
            },
          },
          {
            overrides: ['color-primary'],
          },
        )

        expect(atomized.vars).toEqual({
          '--color-primary': '#f00',
        })
        expect(atomized.ref).toEqual({
          color: {
            primary: 'var(--color-primary, #f00)',
          },
        })
      })

      it('supports dot notation in overrides', () => {
        const atomized = atomizer(
          {
            colors: {
              red: {
                500: '#f00',
                600: '#e00',
              },
            },
          },
          {
            overrides: ['colors.red.500'],
          },
        )

        expect(atomized.metadata).toEqual({
          '--colors-red-600': {
            syntax: '<color>',
            inherits: false,
            initialValue: '#e00',
          },
        })
        expect(atomized.metadata['--colors-red-500']).toBeUndefined()
      })
    })
  })
})
