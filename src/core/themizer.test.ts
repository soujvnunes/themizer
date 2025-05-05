import path from 'node:path'
import fs from 'node:fs'

import renderHTML from '../test-utils/renderHTML'

import THEME_FILE_NAME from '../consts/themeFileName'
import THEME_FILE_DIRECTORY from '../consts/themeFileDirectory'

import themizer from './themizer'
import resolveAtom from './resolveAtom'

describe('themizer', () => {
  function unlink(outDir?: string) {
    fs.unlinkSync(
      path.resolve(...([process.cwd(), outDir, THEME_FILE_NAME].filter(Boolean) as string[])),
    )
  }

  describe('using the default `src` output directory', () => {
    afterAll(() => {
      unlink(THEME_FILE_DIRECTORY)
    })

    describe('taking aliases and options', () => {
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

      it('returns its prefixed reference and tokens one with specified media and CSS rules', () => {
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
      })
      it('its styles are applied to the DOM', async () => {
        const html = await renderHTML(
          `<p id="element" style="color: ${theme.aliases.palette.main}; font-size: ${theme.aliases.sizing.md}"></p>`,
          { path: `./${THEME_FILE_DIRECTORY}/${THEME_FILE_NAME}` },
        )

        expect(await html.setScreenType('mobile.light')).toEqual({
          color: resolveAtom(theme.tokens.colors.amber.dark),
          fontSize: resolveAtom(theme.tokens.units[16]),
        })
        expect(await html.setScreenType('desktop.dark')).toEqual({
          color: resolveAtom(theme.tokens.colors.amber.light),
          fontSize: resolveAtom(theme.tokens.units[24]),
        })
      }, 1000)
    })
  })

  describe('using the root output directory', () => {
    afterAll(() => {
      unlink()
    })

    describe('taking different aliases than the previous ones and options', () => {
      const theme = themizer(
        {
          prefix: 'ds',
          outDir: 'root',
          medias: { dark: '(prefers-color-scheme: dark)' },
          tokens: { color: { white: 'rgb(255, 255, 255)' } },
        },
        (tokens) => ({ palette: { text: [{ dark: tokens.color.white }] } }),
      )

      it('returns its prefixed reference and tokens one with specified media and CSS rules', () => {
        expect(theme.tokens).toEqual({
          color: { white: 'var(--ds-tokens-color-white, rgb(255, 255, 255))' },
        })
        expect(theme.aliases).toEqual({
          palette: { text: 'var(--ds-aliases-palette-text)' },
        })
        expect(theme.medias).toEqual({
          dark: '@media (prefers-color-scheme: dark)',
        })
      })
      it('its styles are applied to the DOM', async () => {
        const html = await renderHTML(
          `<p id="element" style="color: ${theme.aliases.palette.text};"></p>`,
          { path: `./${THEME_FILE_NAME}` },
        )

        expect(await html.setScreenType('mobile.light')).toEqual({
          color: 'rgb(0, 0, 0)',
          fontSize: '16px',
        })
        expect(await html.setScreenType('desktop.dark')).toEqual({
          color: resolveAtom(theme.tokens.color.white),
          fontSize: '16px',
        })
      }, 1000)
    })
  })

  describe('using a custom output directory', () => {
    const CUSTOM_OUTDIR = 'app/styles'

    afterAll(() => {
      unlink(CUSTOM_OUTDIR)
    })

    describe('taking different aliases than the previous ones and options', () => {
      const theme = themizer(
        {
          prefix: 'ds',
          outDir: CUSTOM_OUTDIR,
          medias: { dark: '(prefers-color-scheme: dark)' },
          tokens: { color: { gray: 'rgb(127, 127, 127)' } },
        },
        (tokens) => ({ palette: { text: [{ dark: tokens.color.gray }] } }),
      )

      it('returns its prefixed reference and tokens one with specified media and CSS rules', () => {
        expect(theme.tokens).toEqual({
          color: { gray: 'var(--ds-tokens-color-gray, rgb(127, 127, 127))' },
        })
        expect(theme.aliases).toEqual({ palette: { text: 'var(--ds-aliases-palette-text)' } })
        expect(theme.medias).toEqual({ dark: '@media (prefers-color-scheme: dark)' })
      })
      it('its styles are applied to the DOM', async () => {
        const html = await renderHTML(
          `<p id="element" style="color: ${theme.aliases.palette.text};"></p>`,
          { path: `./${CUSTOM_OUTDIR}/${THEME_FILE_NAME}` },
        )

        expect(await html.setScreenType('mobile.light')).toEqual({
          color: 'rgb(0, 0, 0)',
          fontSize: '16px',
        })
        expect(await html.setScreenType('desktop.dark')).toEqual({
          color: resolveAtom(theme.tokens.color.gray),
          fontSize: '16px',
        })
      }, 1000)
    })
  })
})
