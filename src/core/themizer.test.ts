import themizer from './themizer'
import resolveAtom from './resolveAtom'
import renderHTML from '../test-utils/renderHTML'

describe('themizer', () => {
  describe('taking aliases and options', () => {
    const theme = themizer(
      (tokens) => ({
        palette: { main: { dark: tokens.colors.amber.light, DEFAULT: tokens.colors.amber.dark } },
        spacing: { md: tokens.units[24] },
        sizing: { md: { desktop: tokens.units[24], DEFAULT: tokens.units[16] } },
      }),
      {
        prefix: 'ds',
        medias: {
          dark: '(prefers-color-scheme: dark)',
          desktop: '(min-width: 1024px)',
        },
        tokens: {
          colors: { amber: { light: 'rgb(251, 191, 36)', dark: 'rgb(217, 119, 6)' } },
          units: { 24: '24px', 16: '16px' },
        } as const,
      },
    )

    it('returns its prefixed reference and tokens one with specified media and CSS rules', () => {
      expect(theme).toEqual({
        aliases: {
          palette: {
            main: 'var(--ds-aliases-palette-main, var(--ds-tokens-colors-amber-dark, rgb(217, 119, 6)))',
          },
          sizing: {
            md: 'var(--ds-aliases-sizing-md, var(--ds-tokens-units-16, 16px))',
          },
          spacing: {
            md: 'var(--ds-aliases-spacing-md, var(--ds-tokens-units-24, 24px))',
          },
        },
        medias: {
          dark: '(prefers-color-scheme: dark)',
          desktop: '(min-width: 1024px)',
        },
        tokens: {
          colors: {
            amber: {
              light: 'var(--ds-tokens-colors-amber-light, rgb(251, 191, 36))',
              dark: 'var(--ds-tokens-colors-amber-dark, rgb(217, 119, 6))',
            },
          },
          units: {
            '16': 'var(--ds-tokens-units-16, 16px)',
            '24': 'var(--ds-tokens-units-24, 24px)',
          },
        },
        rules: {
          css: ':root{--ds-tokens-colors-amber-light:rgb(251, 191, 36);--ds-tokens-colors-amber-dark:rgb(217, 119, 6);--ds-tokens-units-16:16px;--ds-tokens-units-24:24px;--ds-aliases-palette-main:var(--ds-tokens-colors-amber-dark, rgb(217, 119, 6));--ds-aliases-spacing-md:var(--ds-tokens-units-24, 24px);--ds-aliases-sizing-md:var(--ds-tokens-units-16, 16px);}@media (prefers-color-scheme: dark){:root{--ds-aliases-palette-main:var(--ds-tokens-colors-amber-light, rgb(251, 191, 36));}}@media (min-width: 1024px){:root{--ds-aliases-sizing-md:var(--ds-tokens-units-24, 24px);}}',
          jss: {
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
          },
        },
      })
    })
    it('its styles are applied to the DOM', async () => {
      const page = await renderHTML(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>${theme.rules.css}</style> 
          </head>
          <body>
            <p id="element" style="color: ${theme.aliases.palette.main}; font-size: ${theme.aliases.sizing.md}"></p> 
          </body>
        </html>
      `)

      let styles = await page.setScreenType('mobile.light')

      expect(styles).toEqual({
        color: resolveAtom(theme.tokens.colors.amber.dark),
        fontSize: resolveAtom(theme.tokens.units[16]),
      })

      styles = await page.setScreenType('desktop.dark')

      expect(styles).toEqual({
        color: resolveAtom(theme.tokens.colors.amber.light),
        fontSize: resolveAtom(theme.tokens.units[24]),
      })
    }, 1000)
  })
})
