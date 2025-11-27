import INTERNAL from './INTERNAL'

describe('INTERNAL', () => {
  describe('exporting modules', () => {
    it('returns a Symbol', () => {
      expect(typeof INTERNAL).toBe('symbol')
    })

    it('uses Symbol.for with correct key', () => {
      expect(INTERNAL).toBe(Symbol.for('themizer.internal'))
    })

    it('is consistent across imports', () => {
      const anotherImport = Symbol.for('themizer.internal')
      expect(INTERNAL).toBe(anotherImport)
    })
  })
})
