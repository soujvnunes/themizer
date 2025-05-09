import getCSS from './getCSS'

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
})
