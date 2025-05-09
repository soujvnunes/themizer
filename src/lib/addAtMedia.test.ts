import addAtMedia from './addAtMedia'

describe('addAtMedia', () => {
  describe('when providing a media parameter', () => {
    it('returns its keys mediafied', () => {
      expect(
        addAtMedia({
          motion: '(prefers-reduced-motion: reduced)',
        }),
      ).toEqual({
        motion: '@media (prefers-reduced-motion: reduced)',
      })
    })
  })
})
