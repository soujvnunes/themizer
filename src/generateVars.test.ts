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
  expect(vars.aliases).toMatchObject({
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
      prefixKeys: 'tokens',
    },
  );

  expect(vars.value).toMatchObject({
    '--tokens-colors-white': '#fff',
    '--tokens-colors-red-500': '#f00',
    '--tokens-spaces-md': '1rem',
  });
  expect(vars.aliases).toMatchObject({
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
