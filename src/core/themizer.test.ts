import AtomsTempFile from '../helpers/AtomsTempFile'

import themizer from './themizer'

describe('themizer', () => {
  afterAll(() => {
    jest.resetModules()
  })

  beforeEach(() => {
    jest.spyOn(AtomsTempFile, 'write').mockImplementation(jest.fn)
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
  })
  it('writes its generated CSS custom properties to the temporary atoms file', () => {
    expect(AtomsTempFile.write).toHaveBeenCalledWith(
      ':root{--ds-tokens-colors-amber-light:rgb(251, 191, 36);--ds-tokens-colors-amber-dark:rgb(217, 119, 6);--ds-tokens-units-16:16px;--ds-tokens-units-24:24px;--ds-aliases-palette-main:var(--ds-tokens-colors-amber-dark, rgb(217, 119, 6));--ds-aliases-spacing-md:var(--ds-tokens-units-24, 24px);--ds-aliases-sizing-md:var(--ds-tokens-units-16, 16px);}@media (prefers-color-scheme: dark){:root{--ds-aliases-palette-main:var(--ds-tokens-colors-amber-light, rgb(251, 191, 36));}}@media (min-width: 1024px){:root{--ds-aliases-sizing-md:var(--ds-tokens-units-24, 24px);}}',
    )
  })
})
