import ATOM_REGEX from './ATOM_REGEX'

describe('atomRegex', () => {
  describe('exporting modules', () => {
    it('returns its functions', () => {
      expect(ATOM_REGEX).toBeInstanceOf(RegExp)
      expect(ATOM_REGEX).not.toBeFalsy()
    })
  })
})
