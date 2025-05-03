import getVar from './getVar'

describe('getVar', () => {
  describe('when providing the variable parameter', () => {
    describe('with the default value parameter', () => {
      it('returns it wrapped', () => {
        expect(getVar('--test', 'foo')).toBe('var(--test, foo)')
      })
      describe('undefined', () => {
        it('returns just the wrapped variable', () => {
          expect(getVar('--test')).toBe('var(--test)')
        })
      })
    })
  })
})
