import ATOMS_FILE_NAME from './ATOMS_FILE_NAME'

describe('ATOMS_FILE_NAME', () => {
  describe('exporting modules', () => {
    it('returns it correctly', () => {
      expect(ATOMS_FILE_NAME).toStrictEqual('atoms.css')
    })
  })
})
