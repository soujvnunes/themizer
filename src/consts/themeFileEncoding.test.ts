import THEME_FILE_ENCODING from './themeFileEncoding'

describe('themeFileEncoding', () => {
  describe('exporting modules', () => {
    it('returns it correctly', () => {
      expect(typeof THEME_FILE_ENCODING === 'string').toBeTruthy()
    })
  })
})
