import THEME_FILE_DIRECTORY from './themeFileDirectory'

describe('themeFileDirectory', () => {
  describe('exporting modules', () => {
    it('returns it correctly', () => {
      expect(typeof THEME_FILE_DIRECTORY === 'string').toBeTruthy()
    })
  })
})
