import getTheme from './getTheme';

describe('getTheme', () => {
  describe('taking aliases', () => {
    const theme = getTheme({
      font: {
        sizes: {
          md: '16px',
        },
      },
    });

    it('returns its reference', () => {
      expect(theme).toEqual({
        aliases: {
          font: {
            sizes: {
              md: 'var(--aliases-font-sizes-md, 16px)',
            },
          },
        },
        rules:
          '@layer theme;@layer theme{:root{--aliases-font-sizes-md:16px;}}',
      });
    });
  });
  describe('taking aliases with options', () => {
    const theme = getTheme(
      (tokens) => ({
        palette: {
          main: [{ dark: tokens.colors.amber.light }, tokens.colors.amber.dark],
        },
      }),
      {
        prefixProperties: 'ds',
        medias: {
          dark: '@media (prefers-scheme-color: dark)',
        },
        tokens: {
          colors: {
            amber: {
              light: '#fbbf24',
              dark: '#d97706',
            },
          },
        },
      },
    );

    it('returns its reference and tokens prefixed with medias one', () => {
      expect(theme).toEqual({
        aliases: {
          palette: {
            main: 'var(--ds-aliases-palette-main, var(--ds-tokens-colors-amber-dark, #d97706))',
          },
        },
        medias: {
          dark: '@media (prefers-scheme-color: dark)',
        },
        tokens: {
          colors: {
            amber: {
              light: 'var(--ds-tokens-colors-amber-light, #fbbf24)',
              dark: 'var(--ds-tokens-colors-amber-dark, #d97706)',
            },
          },
        },
        rules:
          '@layer theme;@layer theme{:root{--ds-tokens-colors-amber-light:#fbbf24;--ds-tokens-colors-amber-dark:#d97706;--ds-aliases-palette-main:var(--ds-tokens-colors-amber-dark, #d97706);@media (prefers-scheme-color: dark){--ds-aliases-palette-main:var(--ds-tokens-colors-amber-light, #fbbf24);}}}',
      });
    });
  });
});
