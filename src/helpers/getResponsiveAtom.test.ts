import getResponsiveAtom from './getResponsiveAtom'

describe('getResponsiveAtom', () => {
  describe('when providing the medias options', () => {
    const isResponsiveAtom = getResponsiveAtom({ md: '(min-width: 420px)' })

    describe('with matching responsive atoms', () => {
      it('returns true', () => {
        expect(isResponsiveAtom({ md: 4 })).toBeTruthy()
      })
    })
    describe('with non-matching responsive atoms', () => {
      it('returns false', () => {
        expect(isResponsiveAtom({ lg: 8 })).toBeFalsy()
      })
    })
    describe('with empty value', () => {
      it('returns false', () => {
        expect(isResponsiveAtom({})).toBeFalsy()
      })
    })
  })
  describe('when not providing the medias options', () => {
    const isResponsiveAtom = getResponsiveAtom({})

    describe('with any value', () => {
      it('returns false', () => {
        expect(isResponsiveAtom({})).toBeFalsy()
      })
    })
  })
})
