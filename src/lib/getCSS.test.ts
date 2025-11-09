import getCSS from './getCSS'
import type { PropertyMetadataMap } from './inferSyntax'

describe('getCSS', () => {
  describe('when providing the vars parameter', () => {
    it('returns the stringified custom properties', () => {
      const css = getCSS({
        '--spaces-md': 16,
        '--bounce': 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
      })

      expect(css).toBe(':root{--spaces-md:16;--bounce:cubic-bezier(0.5, -0.5, 0.25, 1.5);}')
    })

    describe('with media queries', () => {
      it('returns custom properties within each correspondent media query', () => {
        const css = getCSS({
          '--spaces-md': 16,
          '--bounce': 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
          '@media (min-width: 1024px)': {
            '--spaces-md': 32,
          },
          '@media (prefers-reduced-motion: reduce)': {
            '--bounce': 'cubic-bezier(0.25, -0.25, 0, 0.5)',
          },
        })

        expect(css).toBe(
          ':root{--spaces-md:16;--bounce:cubic-bezier(0.5, -0.5, 0.25, 1.5);}@media (min-width: 1024px){:root{--spaces-md:32;}}@media (prefers-reduced-motion: reduce){:root{--bounce:cubic-bezier(0.25, -0.25, 0, 0.5);}}',
        )
      })
    })
  })

  describe('when providing metadata parameter', () => {
    it('generates @property rules before :root', () => {
      const metadata: PropertyMetadataMap = {
        '--color-primary': {
          syntax: '<color>',
          inherits: false,
          initialValue: 'oklch(76.9% 0.188 70.08)',
        },
        '--spacing-md': {
          syntax: '<length>',
          inherits: false,
          initialValue: '1rem',
        },
      }

      const css = getCSS(
        {
          '--color-primary': 'oklch(76.9% 0.188 70.08)',
          '--spacing-md': '1rem',
        },
        metadata,
      )

      expect(css).toBe(
        '@property --color-primary{syntax:"<color>";inherits:false;initial-value:oklch(76.9% 0.188 70.08);}@property --spacing-md{syntax:"<length>";inherits:false;initial-value:1rem;}:root{--color-primary:oklch(76.9% 0.188 70.08);--spacing-md:1rem;}',
      )
    })

    it('generates @property rules with various syntax types', () => {
      const metadata: PropertyMetadataMap = {
        '--angle': {
          syntax: '<angle>',
          inherits: false,
          initialValue: '45deg',
        },
        '--duration': {
          syntax: '<time>',
          inherits: false,
          initialValue: '200ms',
        },
        '--opacity': {
          syntax: '<percentage>',
          inherits: false,
          initialValue: '100%',
        },
      }

      const css = getCSS(
        {
          '--angle': '45deg',
          '--duration': '200ms',
          '--opacity': '100%',
        },
        metadata,
      )

      expect(css).toContain('@property --angle{syntax:"<angle>";inherits:false;initial-value:45deg;}')
      expect(css).toContain('@property --duration{syntax:"<time>";inherits:false;initial-value:200ms;}')
      expect(css).toContain(
        '@property --opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}',
      )
    })

    it('works with media queries and metadata', () => {
      const metadata: PropertyMetadataMap = {
        '--color': {
          syntax: '<color>',
          inherits: false,
          initialValue: '#000',
        },
      }

      const css = getCSS(
        {
          '--color': '#000',
          '@media (prefers-color-scheme: dark)': {
            '--color': '#fff',
          },
        },
        metadata,
      )

      expect(css).toContain('@property --color{syntax:"<color>";inherits:false;initial-value:#000;}')
      expect(css).toContain(':root{--color:#000;}')
      expect(css).toContain('@media (prefers-color-scheme: dark){:root{--color:#fff;}}')
    })
  })
})
