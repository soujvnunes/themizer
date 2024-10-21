import resolveThemePrefix from './resolveThemePrefix';

it('should return the fallback value if [prefixProperties] is undefined correctly', () => {
  expect(resolveThemePrefix('test')).toBe('test');
});

it('should return the prefixed property correctly', () => {
  expect(
    resolveThemePrefix('test', {
      prefixProperties: 'prefix',
    }),
  ).toBe('prefix-test');
});
