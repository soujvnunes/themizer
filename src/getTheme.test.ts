import getTheme from './getTheme';

describe('getTheme', () => {
  describe('taking aliases and options', () => {
    const theme = getTheme(
      (tokens) => ({
        palette: {
          main: [{ dark: tokens.colors.amber.light }, tokens.colors.amber.dark],
        },
      }),
      {
        prefixVars: 'ds',
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

    it('returns its prefixed reference and tokens one with specified media and CSS rules', () => {
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

    describe('with multiple medias', () => {
      const theme = getTheme(
        (tokens) => ({
          palette: {
            main: [
              { dark: tokens.colors.amber.light },
              tokens.colors.amber.dark,
            ],
          },
          spacing: {
            md: tokens.units[24],
          },
          sizing: {
            md: [{ desktop: tokens.units[24] }, tokens.units[16]],
          },
        }),
        {
          prefixVars: 'ds',
          medias: {
            dark: '@media (prefers-scheme-color: dark)',
            desktop: '@media (min-width: 1024px)',
          },
          tokens: {
            colors: {
              amber: {
                light: '#fbbf24',
                dark: '#d97706',
              },
            },
            units: {
              '24': '1.5rem',
              '16': '1rem',
            },
          } as const,
        },
      );

      it('returns each CSS rule within related media', () => {
        expect(theme).toEqual({
          aliases: {
            palette: {
              main: 'var(--ds-aliases-palette-main, var(--ds-tokens-colors-amber-dark, #d97706))',
            },
            sizing: {
              md: 'var(--ds-aliases-sizing-md, var(--ds-tokens-units-16, 1rem))',
            },
            spacing: {
              md: 'var(--ds-aliases-spacing-md, var(--ds-tokens-units-24, 1.5rem))',
            },
          },
          medias: {
            dark: '@media (prefers-scheme-color: dark)',
            desktop: '@media (min-width: 1024px)',
          },
          tokens: {
            colors: {
              amber: {
                light: 'var(--ds-tokens-colors-amber-light, #fbbf24)',
                dark: 'var(--ds-tokens-colors-amber-dark, #d97706)',
              },
            },
            units: {
              '16': 'var(--ds-tokens-units-16, 1rem)',
              '24': 'var(--ds-tokens-units-24, 1.5rem)',
            },
          },
          rules:
            '@layer theme;@layer theme{:root{--ds-tokens-colors-amber-light:#fbbf24;--ds-tokens-colors-amber-dark:#d97706;--ds-tokens-units-16:1rem;--ds-tokens-units-24:1.5rem;--ds-aliases-palette-main:var(--ds-tokens-colors-amber-dark, #d97706);@media (prefers-scheme-color: dark){--ds-aliases-palette-main:var(--ds-tokens-colors-amber-light, #fbbf24);}--ds-aliases-spacing-md:var(--ds-tokens-units-24, 1.5rem);--ds-aliases-sizing-md:var(--ds-tokens-units-16, 1rem);@media (min-width: 1024px){--ds-aliases-sizing-md:var(--ds-tokens-units-24, 1.5rem);}}}',
        });
      });
    });
  });
});
