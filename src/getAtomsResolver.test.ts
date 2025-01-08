import getAtomsResolver from './getAtomsResolver';

describe('getAtomsResolver', () => {
  describe('when providing the generated vars parameter', () => {
    it('returns the vars resolver to spread value and reference keys', () => {
      const resolveAtoms = getAtomsResolver({
        value: { font: { sizes: 1 } },
        reference: { font: { sizes: { md: 1, lg: 0 } } },
      });
      const resolvedVars = resolveAtoms({ hello: 'world' }, { foo: 'bar' });

      expect(resolvedVars).toEqual({
        value: { font: { sizes: 1 }, hello: 'world' },
        reference: { font: { sizes: { md: 1, lg: 0 } }, foo: 'bar' },
      });
    });
  });
});
