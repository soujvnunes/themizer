import { existsSync } from 'node:fs'
import * as writeThemeFile from '../helpers/writeThemeFile'
import * as executeConfig from '../helpers/executeConfig'

import { themeAction } from './theme'

jest.mock('node:fs')

describe('theme', () => {
  const OPTS = { outDir: './src' }

  let writeThemeFileSpy: jest.SpyInstance
  let existsSyncMock: jest.MockedFunction<typeof existsSync>

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    jest.spyOn(console, 'log').mockImplementation(jest.fn())
    jest.spyOn(process, 'exit').mockImplementation(jest.fn as never)

    writeThemeFileSpy = jest.spyOn(writeThemeFile, 'default').mockImplementation(jest.fn())
    jest.spyOn(executeConfig, 'default').mockImplementation(jest.fn())
    existsSyncMock = existsSync as jest.MockedFunction<typeof existsSync>
    existsSyncMock.mockReturnValue(true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('called without options', () => {
    it('exits', async () => {
      await themeAction({})

      expect(process.exit).toHaveBeenCalledWith(1)
      expect(console.error).toHaveBeenCalledWith(
        'themizer: Missing output directory argument for the theme command',
      )
    })
  })

  describe('when config file does not exist', () => {
    it('exits with error message', async () => {
      existsSyncMock.mockReturnValue(false)

      await themeAction(OPTS)

      expect(process.exit).toHaveBeenCalledWith(1)
      expect(console.error).toHaveBeenCalledWith(
        'themizer: themizer.config.ts not found in current directory',
      )
    })
  })
  describe('called with options', () => {
    it('writes theme to the output directory file', async () => {
      await themeAction(OPTS)

      expect(executeConfig.default).toHaveBeenCalledWith(expect.stringContaining('themizer.config.ts'))
      expect(writeThemeFile.default).toHaveBeenLastCalledWith(OPTS.outDir)
      expect(console.log).toHaveBeenCalledWith(
        `themizer: theme.css written to ${OPTS.outDir} directory`,
      )
    })
    describe('encountering errors', () => {
      it('exits', async () => {
        writeThemeFileSpy.mockRejectedValue(new Error('Test error'))

        await themeAction(OPTS)

        expect(process.exit).toHaveBeenCalledWith(1)
        expect(console.error).toHaveBeenCalledWith('themizer: Failed to write theme.css - Test error')
      })
    })
  })
})
