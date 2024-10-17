import sum from './sum';

it('it should sum correctly', () => {
  const result = sum(1, 2, 3);

  expect(result).toBe(6);
});
