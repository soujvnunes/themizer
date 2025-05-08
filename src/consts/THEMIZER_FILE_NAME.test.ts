import THEMIZER_FILE_NAME from './THEMIZER_FILE_NAME'

describe('themeFileName', () => {
  describe('exporting modules', () => {
    it('returns it correctly', () => {
      expect(typeof THEMIZER_FILE_NAME === 'string').toBeTruthy()
    })
  })
})
