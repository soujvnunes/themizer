import getRules from './getRules';

it('should stringify primitive values correctly', () => {
  const css = getRules({
    '--tokens-colors-white': '#fff',
    '--tokens-colors-red-500': '#f00',
    '--tokens-spaces-md': '1rem',
  });

  expect(css).toContain(
    `@layer theme;@layer theme{:root{--tokens-colors-white:#fff;--tokens-colors-red-500:#f00;--tokens-spaces-md:1rem;}}`,
  );
});

it('should stringify responsive values correctly', () => {
  const css = getRules({
    '--tokens-colors-white': '#fff',
    '--tokens-spaces-md': '1rem',
    '@media (prefers-color-scheme: dark)': {
      '--colors-white': '#333',
      '--alphas-primary': 1,
    },
  });

  expect(css).toContain(
    `@layer theme;@layer theme{:root{--tokens-colors-white:#fff;--tokens-spaces-md:1rem;@media (prefers-color-scheme: dark){--colors-white:#333;--alphas-primary:1;}}}`,
  );
});
