import resolveAtom from './resolveAtom'

describe('resolveAtom', () => {
  describe('when providing the wrapped custom property', () => {
    describe('without default value parameter', () => {
      it('throws an error', () => {
        expect(() => resolveAtom('var(--test-a)')).toThrow(
          "themizer/resolveAtom: Expected wrapped custom property 'var(--test-a)' to have a default value.",
        )
      })
    })
    describe('with default value parameter', () => {
      it('returns only the custom property', () => {
        expect(resolveAtom('var(--test-b, 78)')).toBe(78)
        expect(resolveAtom('var(--test-b, 16px)')).toBe('16px')
        expect(resolveAtom('var(--test-b, #fff)')).toBe('#fff')
        expect(resolveAtom('var(--test-b, 123 123 123)')).toBe('123 123 123')
        expect(resolveAtom('var(--test-b, rgb(123 123 123))')).toBe('rgb(123 123 123)')
      })
      describe('as custom property', () => {
        it.skip('returns only the custom property', () => {
          expect(resolveAtom('var(--test-c, var(--test-b, 78))')).toBe(78)
          expect(resolveAtom('var(--test-c, var(--test-b, 16px))')).toBe('16px')
          expect(resolveAtom('var(--test-c, var(--test-b, #fffFFF))')).toBe('#fffFFF')
          expect(resolveAtom('var(--test-b, var(--test-b, 123 123 123))')).toBe('123 123 123')
          expect(resolveAtom('var(--test-b, var(--test-b, rgb(123 123 123)))')).toBe('rgb(123 123 123)')
        })
      })
    })
  })
})
