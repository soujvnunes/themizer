import * as uiTokens from './index';

describe('ui-tokens', () => {
  describe('exporting modules', () => {
    it('returns its functions', () => {
      expect(uiTokens.generateVars).toBeInstanceOf(Function);
      expect(uiTokens.getTheme).toBeInstanceOf(Function);
      expect(uiTokens.unwrap).toBeInstanceOf(Function);
    });
  });
});
