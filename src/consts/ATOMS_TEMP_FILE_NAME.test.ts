import ATOMS_TEMP_FILE_NAME from './ATOMS_TEMP_FILE_NAME'

describe('ATOMS_TEMP_FILE_NAME', () => {
  describe('exporting modules', () => {
    it('returns it correctly', () => {
      expect(ATOMS_TEMP_FILE_NAME).toStrictEqual('atoms.css.text')
    })
  })
})
