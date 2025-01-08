import * as themizer from './index';

describe('themizer', () => {
  describe('exporting modules', () => {
    const modules = [
      'atomizer',
      'unwrapAtom',
      'resolveAtom',
      'default',
    ] as const;

    it('returns its functions', () => {
      modules.forEach((module) =>
        expect(themizer[module]).toBeInstanceOf(Function),
      );
      modules.forEach((module) => expect(themizer[module]).not.toBeFalsy());
    });
  });
});
