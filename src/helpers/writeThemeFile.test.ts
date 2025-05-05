import path from 'node:path'
import fs from 'node:fs'

import writeThemeFile, { WriteThemeFileParams } from './writeThemeFile'

import THEME_FILE_NAME from '../consts/themeFileName'
import THEME_FILE_ENCODING from '../consts/themeFileEncoding'
import THEME_FILE_DIRECTORY from '../consts/themeFileDirectory'

describe('writeThemeFile', () => {
  let atoms = ':root { --hello: "world"; }'

  const ROOT_MOCK = '.'

  function expectWriteThemeFileCalls({ atoms, outDir = THEME_FILE_DIRECTORY }: WriteThemeFileParams) {
    expect(process.cwd).toHaveBeenCalled()
    expect(fs.readFileSync).toHaveReturnedWith(atoms)
    expect(path.resolve).toHaveBeenCalledWith(
      ...[ROOT_MOCK, outDir === 'root' ? '' : outDir, THEME_FILE_NAME].filter(Boolean),
    )
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      (outDir === 'root' ? './' : `./${outDir}/`) + THEME_FILE_NAME,
      atoms,
      THEME_FILE_ENCODING,
    )
  }

  beforeEach(() => {
    jest.resetModules()
    jest.spyOn(process, 'cwd').mockReturnValue(ROOT_MOCK)
    jest.spyOn(fs, 'mkdirSync').mockImplementation(jest.fn())
    jest.spyOn(fs, 'writeFileSync').mockImplementation(jest.fn)
    jest.spyOn(path, 'resolve').mockImplementation((...args) => args.join('/'))
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => atoms)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when providing the atoms parameter', () => {
    describe('with the default output directory parameter', () => {
      it('writes them in the CSS placeholder atoms file', () => {
        writeThemeFile({ atoms })

        expectWriteThemeFileCalls({ atoms })
      })
    })
    describe("that's equal to the previous one", () => {
      it('skips writing them in the CSS placeholder atoms file', () => {
        writeThemeFile({ atoms })

        expect(process.cwd).not.toHaveBeenCalled()
        expect(path.resolve).not.toHaveBeenCalled()
        expect(fs.mkdirSync).not.toHaveBeenCalled()
        expect(fs.writeFileSync).not.toHaveBeenCalled()
        expect(fs.readFileSync).not.toHaveBeenCalled()
      })
    })
    describe("that's different to the previous one", () => {
      it('writes them in the CSS placeholder atoms file', () => {
        atoms += ':root { --foo: "bar"; }'

        writeThemeFile({ atoms })

        expectWriteThemeFileCalls({ atoms })
      })
    })
    describe('with the output directory parameter as root', () => {
      it('writes them in the CSS placeholder atoms file', () => {
        atoms += ':root { --foz: "baz"; }'

        writeThemeFile({ atoms, outDir: 'root' })

        expectWriteThemeFileCalls({ atoms, outDir: 'root' })
      })
    })
    describe('with the output directory parameter customized', () => {
      it('writes them in the CSS placeholder atoms file', () => {
        atoms += ':root { --bar: "baz"; }'

        writeThemeFile({ atoms, outDir: 'pages/style' })

        expectWriteThemeFileCalls({ atoms, outDir: 'pages/style' })
      })
    })
  })
})
