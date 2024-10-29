import resolve from './resolve';

describe('resolve', () => {
  describe('when providing the wrapped custom property', () => {
    describe('without default value parameter', () => {
      it('throws an error', () => {
        expect(() => resolve('var(--test-a)')).toThrow(
          "ui-tokens/resolve: Expected wrapped custom property 'var(--test-a)' to have a default value.",
        );
      });
    });
    describe('with default value parameter', () => {
      it('returns only the custom property', () => {
        expect(resolve('var(--test-b, 78)')).toBe(78);
        expect(resolve('var(--test-b, 16px)')).toBe('16px');
      });
      describe('as custom property', () => {
        it('returns only the custom property', () => {
          expect(resolve('var(--test-c, var(--test-b, 78))')).toBe(78);
        });
      });
    });
  });
});
