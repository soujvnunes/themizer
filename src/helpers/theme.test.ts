import theme, { Theme } from './theme'

describe('theme', () => {
  afterAll(() => {
    jest.resetModules()
  })

  describe('exporting modules', () => {
    it('returns its instance correctly', () => {
      expect(theme).toBeInstanceOf(Theme)
    })
    it('returns the atoms initial value', () => {
      expect(theme.getAtoms).toBe('')
    })
    it('sets a new value to the atoms property', () => {
      theme.setAtoms('foo')

      expect(theme.getAtoms).toBe('foo')
    })
  })
})
