import TEMP_FILE_EXTENSION from './TEMP_FILE_EXTENSION'

describe('TEMP_FILE_EXTENSION', () => {
  describe('exporting modules', () => {
    it('returns it correctly', () => {
      expect(TEMP_FILE_EXTENSION).toStrictEqual('.tmp')
    })
  })
})
