import PATH_UNIFIER from './pathUnifier'

describe('pathUnifier', () => {
  describe('exporting modules', () => {
    it('returns it correctly', () => {
      expect(typeof PATH_UNIFIER === 'string').toBeTruthy()
    })
  })
})
