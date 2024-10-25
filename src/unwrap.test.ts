import unwrap from './unwrap';

describe('unwrap', () => {
  describe('when providing the reference parameter', () => {
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
  describe('when providing the reference with default value parameter', () => {
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
  describe('when providing the reference with complex default value parameter', () => {
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
