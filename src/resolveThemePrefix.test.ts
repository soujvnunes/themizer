import resolveThemePrefix from './resolveThemePrefix';

describe('resolveThemePrefix', () => {
  describe('when providing the prefix parameter', () => {
    it('returns the default prefix', () => {
      const resolvedThemePrefix = resolveThemePrefix('test');

      expect(resolvedThemePrefix).toBe('test');
    });

    describe('with the prefix properties options parameter', () => {
      it('returns a prefixed default prefix LOL', () => {
        const resolvedThemePrefix = resolveThemePrefix('test', {
          prefixProperties: 'prefix',
        });

        expect(resolvedThemePrefix).toBe('prefix-test');
      });
    });
  });
});
