import themizer from './themizer'
import INTERNAL from '../consts/INTERNAL'

describe('themizer', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    jest.restoreAllMocks()
  })

  it('returns aliases, tokens, and medias in public API', () => {
    const theme = themizer(
      {
        prefix: 'ds',
        medias: { dark: '(prefers-color-scheme: dark)', desktop: '(min-width: 1024px)' },
        tokens: {
          colors: { amber: { light: 'rgb(251, 191, 36)', dark: 'rgb(217, 119, 6)' } },
          sizes: { 24: '24px', 16: '16px' },
        },
      },
      (tokens) => ({
        palette: { main: [{ dark: tokens.colors.amber.light }, tokens.colors.amber.dark] },
        spacing: { md: tokens.sizes[24] },
        sizing: { md: [{ desktop: tokens.sizes[24] }, tokens.sizes[16]] },
      }),
    )

    expect(theme.tokens).toEqual({
      colors: {
        amber: {
          light: 'var(--ds0, rgb(251, 191, 36))',
          dark: 'var(--ds1, rgb(217, 119, 6))',
        },
      },
      sizes: { '16': 'var(--ds2, 16px)', '24': 'var(--ds3, 24px)' },
    })
    expect(theme.aliases).toEqual({
      palette: {
        main: 'var(--ds4, var(--ds1, rgb(217, 119, 6)))',
      },
      sizing: {
        md: 'var(--ds6, var(--ds2, 16px))',
      },
      spacing: {
        md: 'var(--ds5, var(--ds3, 24px))',
      },
    })
    expect(theme.medias).toEqual({
      dark: '@media (prefers-color-scheme: dark)',
      desktop: '@media (min-width: 1024px)',
    })
  })

  describe('with color expansion', () => {
    it('expands color strings in palette to 7 shades and generates correct CSS', () => {
      const theme = themizer(
        {
          prefix: 'app',
          medias: {},
          tokens: {
            palette: {
              amber: 'oklch(76.9% 0.188 70.08)',
            },
          },
        },
        () => ({}),
      )

      expect(theme.tokens.palette.amber).toHaveProperty('lightest')
      expect(theme.tokens.palette.amber).toHaveProperty('lighter')
      expect(theme.tokens.palette.amber).toHaveProperty('light')
      expect(theme.tokens.palette.amber).toHaveProperty('base')
      expect(theme.tokens.palette.amber).toHaveProperty('dark')
      expect(theme.tokens.palette.amber).toHaveProperty('darker')
      expect(theme.tokens.palette.amber).toHaveProperty('darkest')
      expect(theme[INTERNAL].rules.css).toContain('@property --app0')
      expect(theme[INTERNAL].rules.css).toContain('syntax:"<color>"')
      expect(
        Object.keys(theme[INTERNAL].rules.jss).filter((k) => k.startsWith('@property')).length,
      ).toBe(7)
    })

    it('does not expand OKLCH strings in colors property', () => {
      const theme = themizer(
        {
          prefix: 'app',
          medias: {},
          tokens: {
            colors: {
              amber: 'oklch(76.9% 0.188 70.08)',
              blue: {
                500: '#3b82f6',
              },
            },
          },
        },
        () => ({}),
      )

      expect(theme.tokens.colors.amber).toContain('var(')
      expect(theme.tokens.colors).not.toHaveProperty('lightest')
      expect(theme.tokens.colors.blue).toHaveProperty('500')
      expect(theme.tokens.colors.blue['500']).toContain('var(')
      expect(
        Object.keys(theme[INTERNAL].rules.jss).filter((k) => k.startsWith('@property')).length,
      ).toBe(2)
    })
  })

  describe('with unit expansion', () => {
    it('expands unit tuple to numeric sequence and generates correct CSS', () => {
      const theme = themizer(
        {
          prefix: 'app',
          medias: {},
          tokens: {
            units: {
              px: [0, 4, 16],
            },
          },
        },
        () => ({}),
      )

      expect(theme.tokens.units).toHaveProperty('px')
      expect(theme.tokens.units.px).toHaveProperty('0')
      expect(theme.tokens.units.px).toHaveProperty('4')
      expect(theme.tokens.units.px).toHaveProperty('8')
      expect(theme.tokens.units.px).toHaveProperty('12')
      expect(theme.tokens.units.px).toHaveProperty('16')
      expect(theme[INTERNAL].rules.css).toContain('syntax:"<length>"')
      expect(
        Object.keys(theme[INTERNAL].rules.jss).filter((k) => k.startsWith('@property')).length,
      ).toBe(5)
    })
  })

  describe('dev-friendly error handling', () => {
    describe('in production mode', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production'
      })

      it('throws on invalid prefix', () => {
        expect(() => themizer({ prefix: '', medias: {}, tokens: {} }, () => ({}))).toThrow()
      })

      it('throws on invalid palette color', () => {
        expect(() =>
          themizer(
            { prefix: 'app', medias: {}, tokens: { palette: { primary: 'invalid-color' } } },
            () => ({}),
          ),
        ).toThrow()
      })
    })

    describe('in development mode', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development'
      })

      it('logs error and applies fallback prefix for invalid prefix', () => {
        // Need to re-import to pick up new NODE_ENV
        jest.resetModules()
        const errorSpy = jest.spyOn(console, 'error').mockImplementation()
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { default: devThemizer } = require('./themizer')
        const theme = devThemizer({ prefix: '', medias: {}, tokens: {} }, () => ({}))

        expect(errorSpy).toHaveBeenCalled()
        expect(warnSpy).toHaveBeenCalledWith('themizer: Theme built with errors (see above)')
        // Theme should still be built with fallback prefix
        expect(theme[INTERNAL].rules.css).toBeDefined()
      })

      it('logs error and applies fallback color for invalid palette', () => {
        jest.resetModules()
        const errorSpy = jest.spyOn(console, 'error').mockImplementation()
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { default: devThemizer } = require('./themizer')
        const theme = devThemizer(
          { prefix: 'app', medias: {}, tokens: { palette: { primary: 'not-oklch' } } },
          () => ({}),
        )

        expect(errorSpy).toHaveBeenCalled()
        expect(warnSpy).toHaveBeenCalledWith('themizer: Theme built with errors (see above)')
        // Theme should still be built with fallback color
        expect(theme.tokens.palette.primary).toBeDefined()
      })

      it('logs success message when theme builds without errors', () => {
        jest.resetModules()
        const infoSpy = jest.spyOn(console, 'info').mockImplementation()

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { default: devThemizer } = require('./themizer')
        devThemizer(
          { prefix: 'app', medias: {}, tokens: { palette: { amber: 'oklch(76.9% 0.188 70.08)' } } },
          () => ({}),
        )

        expect(infoSpy).toHaveBeenCalledWith('themizer: Theme built successfully')
      })
    })
  })
})
