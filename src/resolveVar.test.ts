import resolveVar from './resolveVar';

describe('resolveVar', () => {
  describe('when providing the wrapped custom property', () => {
    describe('without default value parameter', () => {
      it('throws an error', () => {
        expect(() => resolveVar('var(--test-a)')).toThrow(
          "ui-theme/resolveVar: Expected wrapped custom property 'var(--test-a)' to have a default value.",
        );
      });
    });
    describe('with default value parameter', () => {
      it('returns only the custom property', () => {
        expect(resolveVar('var(--test-b, 78)')).toBe(78);
        expect(resolveVar('var(--test-b, 16px)')).toBe('16px');
        expect(resolveVar('var(--test-b, #fff)')).toBe('#fff');
        expect(resolveVar('var(--test-b, 123 123 123)')).toBe('123 123 123');
        expect(resolveVar('var(--test-b, rgb(123 123 123))')).toBe(
          'rgb(123 123 123)',
        );
      });
      describe('as custom property', () => {
        // TODO: handle complex cases
        it('returns only the custom property', () => {
          expect(resolveVar('var(--test-c, var(--test-b, 78))')).toBe(78);
          expect(resolveVar('var(--test-c, var(--test-b, 16px))')).toBe('16px');
          expect(resolveVar('var(--test-c, var(--test-b, #fffFFF))')).toBe(
            '#fffFFF',
          );
          expect(resolveVar('var(--test-b, var(--test-b, 123 123 123))')).toBe(
            '123 123 123',
          );
          expect(
            resolveVar('var(--test-b, var(--test-b, rgb(123 123 123)))'),
          ).toBe('rgb(123 123 123)');
        });
      });
    });
  });
});
