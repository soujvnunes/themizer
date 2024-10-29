import unwrapVar from './unwrapVar';

describe('unwrapVar', () => {
  describe('when providing the reference parameter', () => {
    it('returns the custom property', () => {
      expect(unwrapVar('var(--test-a)')).toBe('--test-a');
    });
    describe('with default value parameter', () => {
      it('returns only the custom property', () => {
        expect(unwrapVar('var(--test-b, 78)')).toBe('--test-b');
      });
      describe('as custom property', () => {
        it('returns only the custom property', () => {
          expect(unwrapVar('var(--test-c, var(--test-b, 78))')).toBe(
            '--test-c',
          );
        });
      });
    });
  });
});
