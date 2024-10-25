import isPrimitive from './isPrimitive';

describe('isPrimitive', () => {
  describe('when providing a number parameter', () => {
    it('returns true', () => {
      expect(isPrimitive(0)).toBeTruthy();
    });
  });
  describe('when providing a string parameter', () => {
    it('returns true', () => {
      expect(isPrimitive('a')).toBeTruthy();
    });
  });
  describe('when providing an object parameter', () => {
    describe('array-like', () => {
      it('returns false', () => {
        expect(isPrimitive([])).toBeFalsy();
      });
    });
    describe('object-like', () => {
      it('returns false', () => {
        expect(isPrimitive({})).toBeFalsy();
      });
    });
  });
  describe('when providing null or undefined parameter', () => {
    it('returns false', () => {
      expect(isPrimitive(null)).toBeFalsy();
      expect(isPrimitive(undefined)).toBeFalsy();
    });
  });
});
