import THEME_FILE_NAME from './themeFileName'

describe('themeFileName', () => {
  describe('exporting modules', () => {
    it('returns it correctly', () => {
      expect(typeof THEME_FILE_NAME === 'string').toBeTruthy()
    })
  })
})
