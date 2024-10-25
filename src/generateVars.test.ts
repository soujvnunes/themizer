import generateVars from './generateVars';

describe('generateVars', () => {
  describe('when providing the schema parameter', () => {
    it('returns generated vars and its references', () => {
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

      expect(vars.value).toEqual({
        '--colors-white': '#fff',
        '--colors-red-500': '#f00',
        '--spaces-md': '1rem',
      });
      expect(vars.reference).toEqual({
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
  });

  describe('with prefix properties option', () => {
    it('returns prefixed generated vars and its references', () => {
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

      expect(vars.value).toEqual({
        '--tokens-colors-white': '#fff',
        '--tokens-colors-red-500': '#f00',
        '--tokens-spaces-md': '1rem',
      });
      expect(vars.reference).toEqual({
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
  });

  describe('with medias options', () => {
    it('returns generated vars within each media query and its references with default values', () => {
      const vars = generateVars(
        {
          colors: {
            black: '#111',
            gray: [{ print: '#fff' }, '#ddd'],
            white: [{ dark: '#333', printOnDark: '#000' }, '#fff'],
            red: {
              500: [{ print: '#000' }, '#f00'],
            },
          },
          spaces: {
            md: [{ desktop: '1.5rem', tablet: '1.25rem' }, '1rem'],
          },
          font: {
            sans: 'sofia-pro',
            sizes: {
              xl: [{ desktop: '3rem' }, '2rem'],
            },
            weight: {
              500: [{ desktop: 800, tablet: 600 }, 400],
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
            tablet: '@media (min-width: 512px)',
            desktop: '@media (min-width: 1024px)',
            dark: '@media (prefers-color-scheme: dark)',
            motion: '@media (prefers-reduced-motion: no-preference)',
            print: '@media print',
            printOnDark: '@media print and (prefers-color-scheme: dark)',
          },
        },
      );

      expect(vars.value).toEqual({
        '--colors-black': '#111',
        '--colors-gray': '#ddd',
        '--colors-white': '#fff',
        '--colors-red-500': '#f00',
        '--spaces-md': '1rem',
        '--font-sizes-xl': '2rem',
        '--font-sans': 'sofia-pro',
        '--font-weight-500': 400,
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
          '--font-weight-500': 800,
        },
        '@media (prefers-reduced-motion: no-preference)': {
          '--trans-bounce': '200ms cubic-bezier(0.5, -0.5, 0.25, 1.5)',
          '--trans-ease': '200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        },
        '@media print and (prefers-color-scheme: dark)': {
          '--colors-white': '#000',
        },
        '@media (min-width: 512px)': {
          '--spaces-md': '1.25rem',
          '--font-weight-500': 600,
        },
      });
      expect(vars.reference).toEqual({
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
          weight: {
            '500': 'var(--font-weight-500, 400)',
          },
          sizes: {
            xl: 'var(--font-sizes-xl, 2rem)',
          },
        },
        alphas: {
          primary: 'var(--alphas-primary, 0.8)',
          secondary: 'var(--alphas-secondary, 0.6)',
        },
        trans: {
          bounce: 'var(--trans-bounce)',
          ease: 'var(--trans-ease)',
        },
      });
    });
  });
});
