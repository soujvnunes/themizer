import getVarsResolver from './getVarsResolver';

it('should spread value and reference keys correctly', () => {
  const resolveVars = getVarsResolver<
    'dark',
    {
      font: {
        sizes: {
          md: number;
          lg: number;
        };
      };
    }
  >({
    value: {
      font: {
        sizes: 1,
      },
    },
    reference: {
      font: {
        sizes: {
          md: 1,
          lg: 0,
        },
      },
    },
  });

  expect(resolveVars({ hello: 'world' }, { foo: 'bar' })).toEqual({
    value: {
      font: {
        sizes: 1,
      },
      hello: 'world',
    },
    reference: {
      font: {
        sizes: {
          md: 1,
          lg: 0,
        },
      },
      foo: 'bar',
    },
  });
});
