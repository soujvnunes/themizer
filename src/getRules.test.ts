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
        '@layer theme;@layer theme{:root{--tokens-colors-white:#fff;--tokens-colors-red-500:#f00;--tokens-spaces-md:1rem;}}',
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
          '@layer theme;@layer theme{:root{--tokens-colors-white:#fff;--tokens-spaces-md:1rem;@media (prefers-color-scheme: dark){--colors-white:#333;--alphas-primary:1;}}}',
        );
      });
    });

    describe('with multiple media queries', () => {
      it('returns custom properties within each correspondent media query', () => {
        const rules = getRules({
          '--ds-tokens-colors-amber-light': '#fbbf24',
          '--ds-tokens-colors-amber-dark': '#d97706',
          '--ds-tokens-units-16': '1rem',
          '--ds-tokens-units-24': '1.5rem',
          '--ds-aliases-palette-main':
            'var(--ds-tokens-colors-amber-dark, #d97706)',
          '@media (prefers-scheme-color: dark)': {
            '--ds-aliases-palette-main':
              'var(--ds-tokens-colors-amber-light, #fbbf24)',
          },
          '--ds-aliases-spacing-md': 'var(--ds-tokens-units-24, 1.5rem)',
          '--ds-aliases-sizing-md': 'var(--ds-tokens-units-16, 1rem)',
          '@media (min-width: 1024px)': {
            '--ds-aliases-sizing-md': 'var(--ds-tokens-units-24, 1.5rem)',
          },
        });

        expect(rules).toContain(
          '@layer theme;@layer theme{:root{--ds-tokens-colors-amber-light:#fbbf24;--ds-tokens-colors-amber-dark:#d97706;--ds-tokens-units-16:1rem;--ds-tokens-units-24:1.5rem;--ds-aliases-palette-main:var(--ds-tokens-colors-amber-dark, #d97706);@media (prefers-scheme-color: dark){--ds-aliases-palette-main:var(--ds-tokens-colors-amber-light, #fbbf24);}--ds-aliases-spacing-md:var(--ds-tokens-units-24, 1.5rem);--ds-aliases-sizing-md:var(--ds-tokens-units-16, 1rem);@media (min-width: 1024px){--ds-aliases-sizing-md:var(--ds-tokens-units-24, 1.5rem);}}}',
        );
      });
    });
  });
});
