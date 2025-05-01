import PATH_UNIFIER from './pathUnifier'

describe('defaultMedia', () => {
  describe('exporting modules', () => {
    it('returns its functions', () => {
      expect(typeof PATH_UNIFIER === 'string').toBeTruthy()
    })
  })
})
