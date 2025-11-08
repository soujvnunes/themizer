import * as themizer from './index'

describe('themizer', () => {
  describe('exporting modules', () => {
    const modules = ['unwrapAtom', 'resolveAtom', 'cssToFile', 'default'] as const

    it('returns its functions', () => {
      modules.forEach((module) => expect(themizer[module]).toBeInstanceOf(Function))
      modules.forEach((module) => expect(themizer[module]).not.toBeFalsy())
    })
  })
})
