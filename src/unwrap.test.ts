import unwrap from './unwrap';

it('should unwrap a custom property correctly', () => {
  expect(unwrap('var(--test-a)')).toBe('--test-a');
});

it('should unwrap a custom property with default value correctly', () => {
  expect(unwrap('var(--test-b, 78)')).toBe('--test-b');
});

it('should unwrap a custom property complex with default value correctly', () => {
  expect(unwrap('var(--test-c, var(--test-b, 78))')).toBe('--test-c');
});
