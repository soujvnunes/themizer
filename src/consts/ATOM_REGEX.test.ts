import ATOM_REGEX from './ATOM_REGEX'

describe('ATOM_REGEX', () => {
  describe('exporting modules', () => {
    it('returns its functions', () => {
      expect(ATOM_REGEX).toBeInstanceOf(RegExp)
      expect(ATOM_REGEX).toStrictEqual(
        /var\((--[\w-]+)(?:,\s*((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))+))?\)/g,
      )
    })
  })
})
