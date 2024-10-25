import getRules from './getRules';

describe('getRules', () => {
  describe('when providing the vars parameter', () => {
    it('returns the stringified custom properties', () => {
      const rules = getRules({
        '--tokens-colors-white': '#fff',
        '--tokens-colors-red-500': '#f00',
        '--tokens-spaces-md': '1rem',
      });

      expect(rules).toContain(
        `@layer theme;@layer theme{:root{--tokens-colors-white:#fff;--tokens-colors-red-500:#f00;--tokens-spaces-md:1rem;}}`,
      );
    });

    describe('with media queries', () => {
      it('returns custom properties within each correspondent media query', () => {
        const rules = getRules({
          '--tokens-colors-white': '#fff',
          '--tokens-spaces-md': '1rem',
          '@media (prefers-color-scheme: dark)': {
            '--colors-white': '#333',
            '--alphas-primary': 1,
          },
        });

        expect(rules).toContain(
          `@layer theme;@layer theme{:root{--tokens-colors-white:#fff;--tokens-spaces-md:1rem;@media (prefers-color-scheme: dark){--colors-white:#333;--alphas-primary:1;}}}`,
        );
      });
    });
  });
});
