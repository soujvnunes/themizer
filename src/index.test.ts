import * as uiTheme from './index';

describe('ui-theme', () => {
  describe('exporting modules', () => {
    const exportedModules = [
      'generateVars',
      'getTheme',
      'unwrapVar',
      'resolveVar',
    ] as const;

    it('returns its functions', () => {
      exportedModules.forEach((exportedModule) =>
        expect(uiTheme[exportedModule]).toBeInstanceOf(Function),
      );
      exportedModules.forEach((exportedModule) =>
        expect(uiTheme[exportedModule]).not.toBeFalsy(),
      );
    });
  });
});
