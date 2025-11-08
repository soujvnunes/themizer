import getJSS from './getJSS'

describe('getJSS', () => {
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
      it('returns custom properties within each correspondent media query', () => {
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
