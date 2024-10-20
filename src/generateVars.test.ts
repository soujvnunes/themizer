import generateVars from './generateVars';

it('should generate vars correctly', () => {
  const vars = generateVars({
    colors: {
      white: '#fff',
      red: {
        500: '#f00',
      },
    },
    spaces: {
      md: '1rem',
    },
  });

  expect(vars.value).toMatchObject({
    '--colors-white': '#fff',
    '--colors-red-500': '#f00',
    '--spaces-md': '1rem',
  });
  expect(vars.reference).toMatchObject({
    colors: {
      white: 'var(--colors-white, #fff)',
      red: {
        500: 'var(--colors-red-500, #f00)',
      },
    },
    spaces: {
      md: 'var(--spaces-md, 1rem)',
    },
  });
});

it('should prefix generated vars correctly', () => {
  const vars = generateVars(
    {
      colors: {
        white: '#fff',
        red: {
          500: '#f00',
        },
      },
      spaces: {
        md: '1rem',
      },
    },
    {
      prefixProperties: 'tokens',
    },
  );

  expect(vars.value).toMatchObject({
    '--tokens-colors-white': '#fff',
    '--tokens-colors-red-500': '#f00',
    '--tokens-spaces-md': '1rem',
  });
  expect(vars.reference).toMatchObject({
    colors: {
      white: 'var(--tokens-colors-white, #fff)',
      red: {
        500: 'var(--tokens-colors-red-500, #f00)',
      },
    },
    spaces: {
      md: 'var(--tokens-spaces-md, 1rem)',
    },
  });
});

it("should replace correspondent responsive vars' media queries correctly", () => {
  const vars = generateVars(
    {
      colors: {
        black: '#111',
        gray: [{ print: '#fff' }, '#ddd'],
        white: [{ dark: '#333' }, '#fff'],
        red: {
          500: [{ print: '#000' }, '#f00'],
        },
      },
      spaces: {
        md: [{ desktop: '1.5rem' }, '1rem'],
      },
      font: {
        sans: 'sofia-pro',
        sizes: {
          xl: [{ desktop: '3rem' }, '2rem'],
        },
      },
      alphas: {
        primary: [{ dark: 1 }, 0.8],
        secondary: 0.6,
      },
      trans: {
        bounce: [{ motion: '200ms cubic-bezier(0.5, -0.5, 0.25, 1.5)' }],
        ease: [{ motion: '200ms cubic-bezier(0.25, 0.1, 0.25, 1)' }],
      },
    },
    {
      medias: {
        desktop: '@media (min-width: 1024px)',
        dark: '@media (prefers-color-scheme: dark)',
        motion: '@media (prefers-reduced-motion: no-preference)',
        print: '@media print',
      },
    } as const,
  );

  expect(vars.value).toMatchObject({
    '--colors-black': '#111',
    '--colors-gray': '#ddd',
    '--colors-white': '#fff',
    '--colors-red-500': '#f00',
    '--spaces-md': '1rem',
    '--font-sizes-xl': '2rem',
    '--font-sans': 'sofia-pro',
    '--alphas-primary': 0.8,
    '--alphas-secondary': 0.6,
    '@media (prefers-color-scheme: dark)': {
      '--colors-white': '#333',
      '--alphas-primary': 1,
    },
    '@media print': {
      '--colors-gray': '#fff',
      '--colors-red-500': '#000',
    },
    '@media (min-width: 1024px)': {
      '--spaces-md': '1.5rem',
      '--font-sizes-xl': '3rem',
    },
    '@media (prefers-reduced-motion: no-preference)': {
      '--trans-bounce': '200ms cubic-bezier(0.5, -0.5, 0.25, 1.5)',
      '--trans-ease': '200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
  });
  expect(vars.reference).toMatchObject({
    colors: {
      black: 'var(--colors-black, #111)',
      gray: 'var(--colors-gray, #ddd)',
      white: 'var(--colors-white, #fff)',
      red: {
        500: 'var(--colors-red-500, #f00)',
      },
    },
    spaces: {
      md: 'var(--spaces-md, 1rem)',
    },
    font: {
      sans: 'var(--font-sans, sofia-pro)',
      sizes: {
        xl: 'var(--font-sizes-xl, 2rem)',
      },
    },
    alphas: {
      primary: 'var(--alphas-primary, 0.8)',
      secondary: 'var(--alphas-secondary, 0.6)',
    },
    // No default value, because it's only value within `@media`
    trans: {
      bounce: 'var(--trans-bounce)',
      ease: 'var(--trans-ease)',
    },
  });
});
