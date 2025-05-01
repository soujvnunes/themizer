import getJSS from './getJSS'

describe('getJSS', () => {
  describe('when providing the CSS custom property parameter', () => {
    it('returns it within the root element pseudo-class', () => {
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
      it('returns them within the root element pseudo-class', () => {
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
            ':root': { '--spaces-md': 32 },
          },
          '@media (prefers-reduced-motion: reduce)': {
            ':root': { '--bounce': 'cubic-bezier(0.25, -0.25, 0, 0.5)' },
          },
        })
      })
    })
  })
})
