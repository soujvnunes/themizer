import path from 'node:path';
import fs from 'node:fs';
import dispatchVars from './dispatchVars';

describe('dispatchVars', () => {
  describe('when providing the rules parameter', () => {
    const RULES_MOCK = '@layer theme';
    const ROOT_MOCK = '/root';
    const FILE_MOCK = 'variables.css';

    beforeEach(() => {
      jest.spyOn(process, 'cwd').mockReturnValue(ROOT_MOCK);
      jest.spyOn(fs, 'writeFileSync').mockImplementation(jest.fn);
      jest.spyOn(path, 'resolve').mockImplementation((...args) => {
        return args.join('/');
      });
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        return RULES_MOCK;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('returns the written one', () => {
      const rules = dispatchVars(RULES_MOCK);

      expect(rules).toBe(RULES_MOCK);
      expect(process.cwd).toHaveBeenCalled();
      expect(path.resolve).toHaveBeenCalledWith(ROOT_MOCK, FILE_MOCK);
      expect(fs.readFileSync).toHaveReturnedWith(rules);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${ROOT_MOCK}/${FILE_MOCK}`,
        RULES_MOCK,
        'utf-8',
      );
    });
  });
});
