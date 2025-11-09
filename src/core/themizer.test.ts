import themizer from './themizer'

const originalEnv = process.env.NODE_ENV

describe('themizer', () => {
  afterAll(() => {
    jest.resetModules()
    process.env.NODE_ENV = originalEnv
  })

  it('returns its prefixed reference and tokens one with specified media and CSS rules', () => {
    const theme = themizer(
      {
        prefix: 'ds',
        medias: { dark: '(prefers-color-scheme: dark)', desktop: '(min-width: 1024px)' },
        tokens: {
          colors: { amber: { light: 'rgb(251, 191, 36)', dark: 'rgb(217, 119, 6)' } },
          units: { 24: '24px', 16: '16px' },
        },
      },
      (tokens) => ({
        palette: { main: [{ dark: tokens.colors.amber.light }, tokens.colors.amber.dark] },
        spacing: { md: tokens.units[24] },
        sizing: { md: [{ desktop: tokens.units[24] }, tokens.units[16]] },
      }),
    )

    expect(theme.tokens).toEqual({
      colors: {
        amber: {
          light: 'var(--ds-tokens-colors-amber-light, rgb(251, 191, 36))',
          dark: 'var(--ds-tokens-colors-amber-dark, rgb(217, 119, 6))',
        },
      },
      units: { '16': 'var(--ds-tokens-units-16, 16px)', '24': 'var(--ds-tokens-units-24, 24px)' },
    })
    expect(theme.aliases).toEqual({
      palette: {
        main: 'var(--ds-aliases-palette-main, var(--ds-tokens-colors-amber-dark, rgb(217, 119, 6)))',
      },
      sizing: {
        md: 'var(--ds-aliases-sizing-md, var(--ds-tokens-units-16, 16px))',
      },
      spacing: {
        md: 'var(--ds-aliases-spacing-md, var(--ds-tokens-units-24, 24px))',
      },
    })
    expect(theme.medias).toEqual({
      dark: '@media (prefers-color-scheme: dark)',
      desktop: '@media (min-width: 1024px)',
    })
    expect(theme.rules.css).toBe(
      '@property --ds-tokens-colors-amber-light{syntax:"<color>";inherits:false;initial-value:rgb(251, 191, 36);}@property --ds-tokens-colors-amber-dark{syntax:"<color>";inherits:false;initial-value:rgb(217, 119, 6);}@property --ds-tokens-units-16{syntax:"<length>";inherits:false;initial-value:16px;}@property --ds-tokens-units-24{syntax:"<length>";inherits:false;initial-value:24px;}@property --ds-aliases-palette-main{syntax:"*";inherits:false;initial-value:var(--ds-tokens-colors-amber-dark, rgb(217, 119, 6));}@property --ds-aliases-spacing-md{syntax:"*";inherits:false;initial-value:var(--ds-tokens-units-24, 24px);}@property --ds-aliases-sizing-md{syntax:"*";inherits:false;initial-value:var(--ds-tokens-units-16, 16px);}:root{--ds-tokens-colors-amber-light:rgb(251, 191, 36);--ds-tokens-colors-amber-dark:rgb(217, 119, 6);--ds-tokens-units-16:16px;--ds-tokens-units-24:24px;--ds-aliases-palette-main:var(--ds-tokens-colors-amber-dark, rgb(217, 119, 6));--ds-aliases-spacing-md:var(--ds-tokens-units-24, 24px);--ds-aliases-sizing-md:var(--ds-tokens-units-16, 16px);}@media (prefers-color-scheme: dark){:root{--ds-aliases-palette-main:var(--ds-tokens-colors-amber-light, rgb(251, 191, 36));}}@media (min-width: 1024px){:root{--ds-aliases-sizing-md:var(--ds-tokens-units-24, 24px);}}',
    )
    expect(theme.rules.jss).toEqual({
      ':root': {
        '--ds-tokens-colors-amber-light': 'rgb(251, 191, 36)',
        '--ds-tokens-colors-amber-dark': 'rgb(217, 119, 6)',
        '--ds-tokens-units-16': '16px',
        '--ds-tokens-units-24': '24px',
        '--ds-aliases-palette-main': 'var(--ds-tokens-colors-amber-dark, rgb(217, 119, 6))',
        '--ds-aliases-spacing-md': 'var(--ds-tokens-units-24, 24px)',
        '--ds-aliases-sizing-md': 'var(--ds-tokens-units-16, 16px)',
      },
      '@media (prefers-color-scheme: dark)': {
        ':root': {
          '--ds-aliases-palette-main': 'var(--ds-tokens-colors-amber-light, rgb(251, 191, 36))',
        },
      },
      '@media (min-width: 1024px)': {
        ':root': {
          '--ds-aliases-sizing-md': 'var(--ds-tokens-units-24, 24px)',
        },
      },
    })
  })

  describe('production mode', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'production'
    })

    afterAll(() => {
      process.env.NODE_ENV = originalEnv
    })

    it('minifies CSS variable names in production', () => {
      const theme = themizer(
        {
          prefix: 'ds',
          medias: {},
          tokens: {
            colors: { primary: '#000' },
          },
        },
        (tokens) => ({
          text: tokens.colors.primary,
        }),
      )

      // Should have variable map
      expect(theme.variableMap).toBeDefined()
      expect(Object.keys(theme.variableMap ?? {}).length).toBeGreaterThan(0)

      // CSS should use minified names (not full names)
      expect(theme.rules.css).not.toContain('--ds-tokens-colors-primary')
      expect(theme.rules.css).not.toContain('--ds-aliases-text')
    })

    it('maintains type-safe references with minified names', () => {
      const theme = themizer(
        {
          prefix: 'theme',
          medias: {},
          tokens: {
            colors: { red: '#f00' },
          },
        },
        (tokens) => ({
          foreground: tokens.colors.red,
        }),
      )

      // TypeScript types remain unchanged, but runtime values are minified
      expect(theme.tokens.colors.red).toMatch(/^var\(--a\d+,/)
      expect(theme.aliases.foreground).toMatch(/^var\(--a\d+,/)
    })
  })
})
