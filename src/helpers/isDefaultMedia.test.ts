import isDefaultMedia, { DEFAULT_MEDIA } from './isDefaultMedia'

describe('isDefaultMedia', () => {
  describe('when providing a string parameter', () => {
    describe("that's empty", () => {
      it('returns false', () => {
        expect(isDefaultMedia('')).toBeFalsy()
      })
    })
    describe("that's a different value", () => {
      it('returns false', () => {
        expect(isDefaultMedia('a')).toBeFalsy()
      })
    })
    describe("that's the value", () => {
      it('returns true', () => {
        expect(isDefaultMedia(DEFAULT_MEDIA)).toBeTruthy()
      })
    })
  })
})
