import getJSS from './getJSS'
import type { PropertyMetadataMap } from './inferSyntax'

describe('getJSS', () => {
  describe('when providing metadata parameter', () => {
    it('returns @property registration rules in JSS format', () => {
      const metadata: PropertyMetadataMap = {
        '--color-primary': {
          syntax: '<color>',
          inherits: false,
          initialValue: '#000',
        },
        '--spacing-md': {
          syntax: '<length>',
          inherits: false,
          initialValue: '1rem',
        },
      }

      const jss = getJSS(
        {
          '--color-primary': '#000',
          '--spacing-md': '1rem',
        },
        metadata,
      )

      expect(jss).toEqual({
        '@property --color-primary': {
          syntax: '"<color>"',
          inherits: false,
          initialValue: '#000',
        },
        '@property --spacing-md': {
          syntax: '"<length>"',
          inherits: false,
          initialValue: '1rem',
        },
        ':root': {
          '--color-primary': '#000',
          '--spacing-md': '1rem',
        },
      })
    })

    it('returns @property rules with media queries', () => {
      const metadata: PropertyMetadataMap = {
        '--color-fg': {
          syntax: '<color>',
          inherits: false,
          initialValue: '#000',
        },
      }

      const jss = getJSS(
        {
          '--color-fg': '#000',
          '@media (prefers-color-scheme: dark)': {
            '--color-fg': '#fff',
          },
        },
        metadata,
      )

      expect(jss).toEqual({
        '@property --color-fg': {
          syntax: '"<color>"',
          inherits: false,
          initialValue: '#000',
        },
        ':root': {
          '--color-fg': '#000',
        },
        '@media (prefers-color-scheme: dark)': {
          ':root': {
            '--color-fg': '#fff',
          },
        },
      })
    })

    it('returns @property rules with complex values', () => {
      const metadata: PropertyMetadataMap = {
        '--color-mix': {
          syntax: '*',
          inherits: false,
          initialValue: 'var(--color-base)',
        },
      }

      const jss = getJSS(
        {
          '--color-mix': 'var(--color-base)',
        },
        metadata,
      )

      expect(jss).toEqual({
        '@property --color-mix': {
          syntax: '"*"',
          inherits: false,
          initialValue: 'var(--color-base)',
        },
        ':root': {
          '--color-mix': 'var(--color-base)',
        },
      })
    })
  })

  describe('when providing the vars parameter', () => {
    it('returns the custom properties as JSS object within :root', () => {
      const jss = getJSS({
        '--spaces-md': 16,
        '--bounce': 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
      })

      expect(jss).toEqual({
        ':root': {
          '--spaces-md': 16,
          '--bounce': 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
        },
      })
    })

    describe('with media queries', () => {
      it('returns custom properties within each corresponding media query', () => {
        const jss = getJSS({
          '--spaces-md': 16,
          '--bounce': 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
          '@media (min-width: 1024px)': {
            '--spaces-md': 32,
          },
          '@media (prefers-reduced-motion: reduce)': {
            '--bounce': 'cubic-bezier(0.25, -0.25, 0, 0.5)',
          },
        })

        expect(jss).toEqual({
          ':root': {
            '--spaces-md': 16,
            '--bounce': 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
          },
          '@media (min-width: 1024px)': {
            ':root': {
              '--spaces-md': 32,
            },
          },
          '@media (prefers-reduced-motion: reduce)': {
            ':root': {
              '--bounce': 'cubic-bezier(0.25, -0.25, 0, 0.5)',
            },
          },
        })
      })
    })

    describe('with only media queries', () => {
      it('returns JSS object with media queries only', () => {
        const jss = getJSS({
          '@media (min-width: 768px)': {
            '--spacing': '2rem',
          },
        })

        expect(jss).toEqual({
          '@media (min-width: 768px)': {
            ':root': {
              '--spacing': '2rem',
            },
          },
        })
      })
    })
  })
})
