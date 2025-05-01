import isAtom from './isAtom'

describe('isAtom', () => {
  describe('when providing a number parameter', () => {
    it('returns true', () => {
      expect(isAtom(0)).toBeTruthy()
    })
  })
  describe('when providing a string parameter', () => {
    describe("that's empty", () => {
      it('returns false', () => {
        expect(isAtom('')).toBeFalsy()
      })
    })
    describe("that's value", () => {
      it('returns true', () => {
        expect(isAtom('a')).toBeTruthy()
      })
    })
  })
  describe('when providing an object parameter', () => {
    describe('array-like', () => {
      it('returns false', () => {
        expect(isAtom([])).toBeFalsy()
      })
    })
    describe('object-like', () => {
      it('returns false', () => {
        expect(isAtom({})).toBeFalsy()
      })
    })
  })
  describe('when providing null or undefined parameter', () => {
    it('returns false', () => {
      expect(isAtom(null)).toBeFalsy()
      expect(isAtom(undefined)).toBeFalsy()
    })
  })
})
