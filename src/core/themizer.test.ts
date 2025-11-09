import themizer from './themizer'

describe('themizer', () => {

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
          light: 'var(--a0, rgb(251, 191, 36))',
          dark: 'var(--a1, rgb(217, 119, 6))',
        },
      },
      units: { '16': 'var(--a2, 16px)', '24': 'var(--a3, 24px)' },
    })
    expect(theme.aliases).toEqual({
      palette: {
        main: 'var(--a4, var(--a1, rgb(217, 119, 6)))',
      },
      sizing: {
        md: 'var(--a6, var(--a2, 16px))',
      },
      spacing: {
        md: 'var(--a5, var(--a3, 24px))',
      },
    })
    expect(theme.variableMap).toEqual({
      '--a0': '--ds-tokens-colors-amber-light',
      '--a1': '--ds-tokens-colors-amber-dark',
      '--a2': '--ds-tokens-units-16',
      '--a3': '--ds-tokens-units-24',
      '--a4': '--ds-aliases-palette-main',
      '--a5': '--ds-aliases-spacing-md',
      '--a6': '--ds-aliases-sizing-md',
    })
    expect(theme.medias).toEqual({
      dark: '@media (prefers-color-scheme: dark)',
      desktop: '@media (min-width: 1024px)',
    })
    expect(theme.rules.css).toBe(
      '@property --a0{syntax:"<color>";inherits:false;initial-value:rgb(251, 191, 36);}@property --a1{syntax:"<color>";inherits:false;initial-value:rgb(217, 119, 6);}@property --a2{syntax:"<length>";inherits:false;initial-value:16px;}@property --a3{syntax:"<length>";inherits:false;initial-value:24px;}@property --a4{syntax:"*";inherits:false;initial-value:var(--a1, rgb(217, 119, 6));}@property --a5{syntax:"*";inherits:false;initial-value:var(--a3, 24px);}@property --a6{syntax:"*";inherits:false;initial-value:var(--a2, 16px);}:root{--a0:rgb(251, 191, 36);--a1:rgb(217, 119, 6);--a2:16px;--a3:24px;--a4:var(--a1, rgb(217, 119, 6));--a5:var(--a3, 24px);--a6:var(--a2, 16px);}@media (prefers-color-scheme: dark){:root{--a4:var(--a0, rgb(251, 191, 36));}}@media (min-width: 1024px){:root{--a6:var(--a3, 24px);}}',
    )
    expect(theme.rules.jss).toEqual({
      ':root': {
        '--a0': 'rgb(251, 191, 36)',
        '--a1': 'rgb(217, 119, 6)',
        '--a2': '16px',
        '--a3': '24px',
        '--a4': 'var(--a1, rgb(217, 119, 6))',
        '--a5': 'var(--a3, 24px)',
        '--a6': 'var(--a2, 16px)',
      },
      '@media (prefers-color-scheme: dark)': {
        ':root': {
          '--a4': 'var(--a0, rgb(251, 191, 36))',
        },
      },
      '@media (min-width: 1024px)': {
        ':root': {
          '--a6': 'var(--a3, 24px)',
        },
      },
    })
  })
})
