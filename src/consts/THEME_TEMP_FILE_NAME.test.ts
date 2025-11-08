import THEME_TEMP_FILE_NAME from './THEME_TEMP_FILE_NAME'

describe('THEME_TEMP_FILE_NAME', () => {
  describe('exporting modules', () => {
    it('returns it correctly', () => {
      expect(THEME_TEMP_FILE_NAME).toStrictEqual('theme.css.tmp')
    })
  })
})
