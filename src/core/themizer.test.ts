import path from 'node:path'
import fs from 'node:fs'

import renderHTML from '../test-utils/renderHTML'

import THEME_FILE_NAME from '../consts/themeFileName'
import THEME_FILE_ENCODING from '../consts/themeFileEncoding'
import THEME_FILE_DIRECTORY from '../consts/themeFileDirectory'

import themizer from './themizer'
import resolveAtom from './resolveAtom'

describe('themizer', () => {
  afterAll(() => {
    const filePath = path.resolve(process.cwd(), THEME_FILE_DIRECTORY, THEME_FILE_NAME)

    if (fs.existsSync(filePath)) fs.writeFileSync(filePath, '/* Placeholder */', THEME_FILE_ENCODING)
  })

  describe('taking aliases and options', () => {
    const theme = themizer(
      {
        prefix: 'ds',
        medias: {
          dark: '(prefers-color-scheme: dark)',
          desktop: '(min-width: 1024px)',
        },
        tokens: {
          colors: {
            amber: {
              light: 'rgb(251, 191, 36)',
              dark: 'rgb(217, 119, 6)',
            },
          },
          units: {
            24: '24px',
            16: '16px',
          },
        },
      },
      (tokens) => ({
        palette: {
          main: [{ dark: tokens.colors.amber.light }, tokens.colors.amber.dark],
        },
        spacing: {
          md: tokens.units[24],
        },
        sizing: {
          md: [{ desktop: tokens.units[24] }, tokens.units[16]],
        },
      }),
    )

    it('returns its prefixed reference and tokens one with specified media and CSS rules', () => {
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
      expect(theme.tokens).toEqual({
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
      })
    })
    it('its styles are applied to the DOM', async () => {
      const html = await renderHTML(`
        <!DOCTYPE html>
        <html>
          <body>
            <p id="element" style="color: ${theme.aliases.palette.main}; font-size: ${theme.aliases.sizing.md}"></p> 
          </body>
        </html>
      `)

      await page.addStyleTag({ path: `./${THEME_FILE_DIRECTORY}/${THEME_FILE_NAME}` })

      let styles = await html.setScreenType('mobile.light')

      expect(styles).toEqual({
        color: resolveAtom(theme.tokens.colors.amber.dark),
        fontSize: resolveAtom(theme.tokens.units[16]),
      })

      styles = await html.setScreenType('desktop.dark')

      expect(styles).toEqual({
        color: resolveAtom(theme.tokens.colors.amber.light),
        fontSize: resolveAtom(theme.tokens.units[24]),
      })
    }, 1000)
  })
})
