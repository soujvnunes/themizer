import 'jest-puppeteer';
import 'expect-puppeteer';
import getTheme from './getTheme';
import resolveVar from './resolveVar';

describe('getTheme', () => {
  describe('taking aliases and options', () => {
    const theme = getTheme(
      (tokens) => ({
        palette: {
          main: [{ dark: tokens.colors.amber.light }, tokens.colors.amber.dark],
        },
        spacing: { md: tokens.units[24] },
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
            amber: { light: 'rgb(251, 191, 36)', dark: 'rgb(217, 119, 6)' },
          },
          units: { '24': '24px', '16': '16px' },
        } as const,
      },
    );

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
          dark: '@media (prefers-scheme-color: dark)',
          desktop: '@media (min-width: 1024px)',
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
        rules:
          '@layer theme;@layer theme{:root{--ds-tokens-colors-amber-light:rgb(251, 191, 36);--ds-tokens-colors-amber-dark:rgb(217, 119, 6);--ds-tokens-units-16:16px;--ds-tokens-units-24:24px;--ds-aliases-palette-main:var(--ds-tokens-colors-amber-dark, rgb(217, 119, 6));@media (prefers-scheme-color: dark){--ds-aliases-palette-main:var(--ds-tokens-colors-amber-light, rgb(251, 191, 36));}--ds-aliases-spacing-md:var(--ds-tokens-units-24, 24px);--ds-aliases-sizing-md:var(--ds-tokens-units-16, 16px);@media (min-width: 1024px){--ds-aliases-sizing-md:var(--ds-tokens-units-24, 24px);}}}',
      });
    });
    it('its styles are applied to the DOM', async () => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>${theme.rules}</style> 
          </head>
          <body>
            <p id="element" style="color: ${theme.aliases.palette.main}; font-size: ${theme.aliases.sizing.md}"></p> 
          </body>
        </html>
      `);

      function getComputedStyle() {
        return page.evaluate(() => {
          const element = document.getElementById('element');

          if (!element) return;

          const { color, fontSize } = window.getComputedStyle(element);

          return { color, fontSize };
        });
      }

      expect(await getComputedStyle()).toEqual({
        color: resolveVar(theme.tokens.colors.amber.dark),
        fontSize: resolveVar(theme.tokens.units[16]),
      });

      await page.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: 'dark' },
      ]);
      await page.setViewport({ width: 1080, height: 1024 });

      expect(await getComputedStyle()).toEqual({
        color: resolveVar(theme.tokens.colors.amber.dark),
        fontSize: resolveVar(theme.tokens.units[24]),
      });
    });
  });
});
