import PATH_UNIFIER from './PATH_UNIFIER'

describe('PATH_UNIFIER', () => {
  describe('exporting modules', () => {
    it('returns it correctly', () => {
      expect(PATH_UNIFIER).toStrictEqual('-')
    })
  })
})
