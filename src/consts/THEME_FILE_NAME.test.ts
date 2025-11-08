import THEME_FILE_NAME from './THEME_FILE_NAME'

describe('THEME_FILE_NAME', () => {
  describe('exporting modules', () => {
    it('returns it correctly', () => {
      expect(THEME_FILE_NAME).toStrictEqual('theme.css')
    })
  })
})
