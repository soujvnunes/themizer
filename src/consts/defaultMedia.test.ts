import DEFAULT_MEDIA from './defaultMedia'

describe('defaultMedia', () => {
  describe('exporting modules', () => {
    it('returns its functions', () => {
      expect(typeof DEFAULT_MEDIA === 'string').toBeTruthy()
    })
  })
})
