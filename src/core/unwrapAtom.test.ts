import unwrapAtom from './unwrapAtom'

describe('unwrapAtom', () => {
  describe('when providing the reference parameter', () => {
    it('returns the custom property', () => {
      expect(unwrapAtom('var(--test-a)')).toBe('--test-a')
    })
    describe('with default value parameter', () => {
      it('returns only the custom property', () => {
        expect(unwrapAtom('var(--test-b, 78)')).toBe('--test-b')
      })
      describe('as custom property', () => {
        it('returns only the custom property', () => {
          expect(unwrapAtom('var(--test-c, var(--test-b, 78))')).toBe('--test-c')
        })
      })
    })
  })
})
