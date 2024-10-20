import isPrimitive from './isPrimitive';

it('should return boolean based on the parameter correctly', () => {
  expect(isPrimitive(0)).toBeTruthy();
  expect(isPrimitive('a')).toBeTruthy();
  expect(isPrimitive([])).toBeFalsy();
  expect(isPrimitive({})).toBeFalsy();
});
