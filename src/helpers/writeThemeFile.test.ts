import path from 'node:path'
import fs from 'node:fs'

import writeThemeFile from './writeThemeFile'

import THEME_FILE_NAME from '../consts/themeFileName'
import THEME_FILE_ENCODING from '../consts/themeFileEncoding'
import THEME_FILE_DIRECTORY from '../consts/themeFileDirectory'

describe('writeThemeFile', () => {
  let RULES_MOCK = ':root { --hello: "world"; }'

  const ROOT_MOCK = '.'

  function expectCallWriteThemeFile(rules: string) {
    expect(process.cwd).toHaveBeenCalled()
    expect(path.resolve).toHaveBeenCalledWith(ROOT_MOCK, THEME_FILE_DIRECTORY, THEME_FILE_NAME)
    expect(fs.readFileSync).toHaveReturnedWith(rules)
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `./${THEME_FILE_DIRECTORY}/${THEME_FILE_NAME}`,
      rules,
      THEME_FILE_ENCODING,
    )
  }

  beforeEach(() => {
    jest.resetModules()
    jest.spyOn(process, 'cwd').mockReturnValue(ROOT_MOCK)
    jest.spyOn(fs, 'mkdirSync').mockImplementation(jest.fn())
    jest.spyOn(fs, 'writeFileSync').mockImplementation(jest.fn)
    jest.spyOn(path, 'resolve').mockImplementation((...args) => args.join('/'))
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => RULES_MOCK)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when providing the rules parameter', () => {
    it('writes them in the CSS placeholder theme file', () => {
      writeThemeFile(RULES_MOCK)

      expectCallWriteThemeFile(RULES_MOCK)
    })
    describe("that's equal to the previous one", () => {
      it('skips writing them in the CSS placeholder theme file', () => {
        writeThemeFile(RULES_MOCK)

        expect(process.cwd).not.toHaveBeenCalled()
        expect(path.resolve).not.toHaveBeenCalled()
        expect(fs.mkdirSync).not.toHaveBeenCalled()
        expect(fs.writeFileSync).not.toHaveBeenCalled()
        expect(fs.readFileSync).not.toHaveBeenCalled()
      })
    })
    describe("that's different to the previous one", () => {
      it('writes them in the CSS placeholder theme file', () => {
        RULES_MOCK += ':root { --foo: "bar"; }'

        writeThemeFile(RULES_MOCK)

        expectCallWriteThemeFile(RULES_MOCK)
      })
    })
  })
})
