import FILE_ENCODING from './FILE_ENCODING'

describe('FILE_ENCODING', () => {
  describe('exporting modules', () => {
    it('returns it correctly', () => {
      expect(FILE_ENCODING).toStrictEqual('utf-8')
    })
  })
})
