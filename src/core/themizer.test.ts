import themizer from './themizer'

describe('themizer', () => {
  it('returns its prefixed reference and tokens one with specified media and CSS rules', () => {
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
    expect(theme.variableMap).toEqual({
      '--ds0': '--ds-tokens-colors-amber-light',
      '--ds1': '--ds-tokens-colors-amber-dark',
      '--ds2': '--ds-tokens-sizes-16',
      '--ds3': '--ds-tokens-sizes-24',
      '--ds4': '--ds-aliases-palette-main',
      '--ds5': '--ds-aliases-spacing-md',
      '--ds6': '--ds-aliases-sizing-md',
    })
    expect(theme.medias).toEqual({
      dark: '@media (prefers-color-scheme: dark)',
      desktop: '@media (min-width: 1024px)',
    })
    expect(theme.rules.css).toBe(
      '@property --ds0{syntax:"<color>";inherits:false;initial-value:rgb(251, 191, 36);}@property --ds1{syntax:"<color>";inherits:false;initial-value:rgb(217, 119, 6);}@property --ds2{syntax:"<length>";inherits:false;initial-value:16px;}@property --ds3{syntax:"<length>";inherits:false;initial-value:24px;}@property --ds4{syntax:"*";inherits:false;initial-value:var(--ds1, rgb(217, 119, 6));}@property --ds5{syntax:"*";inherits:false;initial-value:var(--ds3, 24px);}@property --ds6{syntax:"*";inherits:false;initial-value:var(--ds2, 16px);}:root{--ds0:rgb(251, 191, 36);--ds1:rgb(217, 119, 6);--ds2:16px;--ds3:24px;--ds4:var(--ds1, rgb(217, 119, 6));--ds5:var(--ds3, 24px);--ds6:var(--ds2, 16px);}@media (prefers-color-scheme: dark){:root{--ds4:var(--ds0, rgb(251, 191, 36));}}@media (min-width: 1024px){:root{--ds6:var(--ds3, 24px);}}',
    )
    expect(theme.rules.jss).toEqual({
      '@property --ds0': {
        syntax: '"<color>"',
        inherits: false,
        initialValue: 'rgb(251, 191, 36)',
      },
      '@property --ds1': {
        syntax: '"<color>"',
        inherits: false,
        initialValue: 'rgb(217, 119, 6)',
      },
      '@property --ds2': {
        syntax: '"<length>"',
        inherits: false,
        initialValue: '16px',
      },
      '@property --ds3': {
        syntax: '"<length>"',
        inherits: false,
        initialValue: '24px',
      },
      '@property --ds4': {
        syntax: '"*"',
        inherits: false,
        initialValue: 'var(--ds1, rgb(217, 119, 6))',
      },
      '@property --ds5': {
        syntax: '"*"',
        inherits: false,
        initialValue: 'var(--ds3, 24px)',
      },
      '@property --ds6': {
        syntax: '"*"',
        inherits: false,
        initialValue: 'var(--ds2, 16px)',
      },
      ':root': {
        '--ds0': 'rgb(251, 191, 36)',
        '--ds1': 'rgb(217, 119, 6)',
        '--ds2': '16px',
        '--ds3': '24px',
        '--ds4': 'var(--ds1, rgb(217, 119, 6))',
        '--ds5': 'var(--ds3, 24px)',
        '--ds6': 'var(--ds2, 16px)',
      },
      '@media (prefers-color-scheme: dark)': {
        ':root': {
          '--ds4': 'var(--ds0, rgb(251, 191, 36))',
        },
      },
      '@media (min-width: 1024px)': {
        ':root': {
          '--ds6': 'var(--ds3, 24px)',
        },
      },
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
      expect(theme.rules.css).toContain('@property --app0')
      expect(theme.rules.css).toContain('syntax:"<color>"')
      expect(Object.keys(theme.rules.jss).filter((k) => k.startsWith('@property')).length).toBe(7)
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
      expect(Object.keys(theme.rules.jss).filter((k) => k.startsWith('@property')).length).toBe(2)
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
      expect(theme.rules.css).toContain('syntax:"<length>"')
      expect(Object.keys(theme.rules.jss).filter((k) => k.startsWith('@property')).length).toBe(5)
    })
  })
})
