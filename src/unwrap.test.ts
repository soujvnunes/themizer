import unwrap from './unwrap';

describe('unwrap', () => {
  describe('when providing the reference for the custom property', () => {
    it('returns the custom property', () => {
      const reference = {
        a: {
          b: {
            c: 'var(--test-a)',
          },
        },
      };

      expect(unwrap(reference.a.b.c)).toBe('--test-a');
    });
  });
  describe('when providing the reference for the custom property with default value', () => {
    it('returns only the custom property', () => {
      const reference = {
        a: {
          b: {
            c: 'var(--test-b, 78)',
          },
        },
      };

      expect(unwrap(reference.a.b.c)).toBe('--test-b');
    });
  });
  describe('when providing the reference for the custom property with complex default value', () => {
    it('returns only the custom property', () => {
      const reference = {
        a: {
          b: {
            c: 'var(--test-c, var(--test-b, 78))',
          },
        },
      };

      expect(unwrap(reference.a.b.c)).toBe('--test-c');
    });
  });
});
