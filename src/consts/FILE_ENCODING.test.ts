import FILE_ENCODING from './FILE_ENCODING'

describe('themeFileEncoding', () => {
  describe('exporting modules', () => {
    it('returns it correctly', () => {
      expect(typeof FILE_ENCODING === 'string').toBeTruthy()
    })
  })
})
