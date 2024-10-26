import dispatchVars from './dispatchVars';
import getRules from './getRules';
import getTheme from './getTheme';

jest.mock('./getRules');
jest.mock('./dispatchVars');

afterAll(() => {
  jest.resetAllMocks();
});

describe('getTheme', () => {
  describe('taking aliases', () => {
    const theme = getTheme({
      font: {
        sizes: {
          md: 16,
        },
      },
    });

    it('returns its reference', () => {
      expect(theme.aliases).toEqual({
        font: {
          sizes: {
            md: 'var(--aliases-font-sizes-md, 16)',
          },
        },
      });
      expect(theme.medias).toBeUndefined();
      expect(theme.tokens).toBeUndefined();
    });
    it('dispatches stringified vars', () => {
      expect(getRules).toHaveBeenCalledWith({ '--aliases-font-sizes-md': 16 });
      expect(dispatchVars).toHaveBeenCalled();
      expect(dispatchVars).toHaveReturned();
      //'@layer theme;@layer theme{:root{--aliases-font-sizes-md: 16}}',
    });
  });
  describe('taking aliases with options', () => {
    const theme = getTheme(
      (tokens) => ({
        palette: {
          main: [{ dark: tokens.colors.amber[400] }, tokens.colors.amber[600]],
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
              400: '#fbbf24',
              600: '#d97706',
            },
          },
        },
      },
    );

    it('returns its reference prefixed', () => {
      expect(theme.aliases).toEqual({
        palette: {
          main: 'var(--ds-aliases-palette-main, var(--ds-tokens-colors-amber-600, #d97706))',
        },
      });
    });
    it('returns its media reference', () => {
      expect(theme.medias).toEqual({
        dark: '@media (prefers-scheme-color: dark)',
      });
    });
    it('returns its tokens reference prefixed', () => {
      expect(theme.tokens).toEqual({
        colors: {
          amber: {
            '400': 'var(--ds-tokens-colors-amber-400, #fbbf24)',
            '600': 'var(--ds-tokens-colors-amber-600, #d97706)',
          },
        },
      });
    });
    it('dispatches stringified vars', () => {
      expect(getRules).toHaveBeenCalledWith({
        '--ds-aliases-palette-main':
          'var(--ds-tokens-colors-amber-600, #d97706)',
        '--ds-tokens-colors-amber-400': '#fbbf24',
        '--ds-tokens-colors-amber-600': '#d97706',
        '@media (prefers-scheme-color: dark)': {
          '--ds-aliases-palette-main':
            'var(--ds-tokens-colors-amber-400, #fbbf24)',
        },
      });
      expect(dispatchVars).toHaveBeenCalled();
      expect(dispatchVars).toHaveReturned();
      //'@layer theme;@layer theme{:root{--aliases-font-sizes-md: 16}}',
    });
  });
});
