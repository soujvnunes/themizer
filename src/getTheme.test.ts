import getTheme from './getTheme';

it('should return prefixed aliases correctly', () => {
  const theme = getTheme(
    {
      font: {
        sizes: {
          md: 16,
        },
      },
    },
    {
      prefixProperties: 'my-design-system',
    },
  );

  expect(theme).toEqual({
    aliases: {
      font: {
        sizes: {
          md: 'var(--my-design-system-aliases-font-sizes-md, 16)',
        },
      },
    },
    vars: {
      '--my-design-system-aliases-font-sizes-md': 16,
    },
  });
});

it('should return medias correctly', () => {
  const theme = getTheme(
    {
      font: {
        sizes: {
          md: 16,
        },
      },
    },
    {
      prefixProperties: 'my-design-system',
      medias: {
        dark: '@media (prefers-scheme-color: dark)',
      },
    },
  );

  expect(theme).toEqual({
    aliases: {
      font: {
        sizes: {
          md: 'var(--my-design-system-aliases-font-sizes-md, 16)',
        },
      },
    },
    medias: {
      dark: '@media (prefers-scheme-color: dark)',
    },
    vars: {
      '--my-design-system-aliases-font-sizes-md': 16,
    },
  });
});

it('should return tokens and handle callable aliases correctly', () => {
  const theme = getTheme(
    (tokens) => ({
      font: {
        sizes: {
          md: [{ dark: tokens.font.sizes.lg }, tokens.font.sizes.md],
        },
      },
    }),
    {
      prefixProperties: 'my-design-system',
      medias: {
        dark: '@media (prefers-scheme-color: dark)',
      },
      tokens: {
        font: {
          sizes: {
            md: 16,
            lg: 24,
          },
        },
      },
    },
  );

  expect(theme).toEqual({
    aliases: {
      font: {
        sizes: {
          md: 'var(--my-design-system-aliases-font-sizes-md, 16)',
        },
      },
    },
    medias: {
      dark: '@media (prefers-scheme-color: dark)',
    },
    tokens: {
      font: {
        sizes: {
          md: 'var(--my-design-system-tokens-font-sizes-md, 16)',
          lg: 'var(--my-design-system-tokens-font-sizes-lg, 24)',
        },
      },
    },
    vars: {
      '--my-design-system-aliases-font-sizes-md': 16,
      '--my-design-system-tokens-font-sizes-md': 16,
      '--my-design-system-tokens-font-sizes-lg': 24,
      '@media (prefers-scheme-color: dark)': {
        '--my-design-system-aliases-font-sizes-md': 24,
      },
    },
  });
});
