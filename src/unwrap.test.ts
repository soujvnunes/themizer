import unwrap from './unwrap';

describe('unwrap', () => {
  describe('when providing the reference parameter', () => {
    it('returns the custom property', () => {
      expect(unwrap('var(--test-a)')).toBe('--test-a');
    });
    describe('with default value parameter', () => {
      it('returns only the custom property', () => {
        expect(unwrap('var(--test-b, 78)')).toBe('--test-b');
      });
      describe('as custom property', () => {
        it('returns only the custom property', () => {
          expect(unwrap('var(--test-c, var(--test-b, 78))')).toBe('--test-c');
        });
      });
    });
  });
});
