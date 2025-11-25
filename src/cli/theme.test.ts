import { existsSync } from 'node:fs'
import * as writeThemeFile from '../helpers/writeThemeFile'

import { themeAction } from './theme'

jest.mock('node:fs')
jest.mock('../helpers/writeThemeFile')

describe('theme', () => {
  const OPTS = { outDir: './src' }

  let writeThemeFileSpy: jest.MockedFunction<typeof writeThemeFile.default>
  let existsSyncMock: jest.MockedFunction<typeof existsSync>

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    jest.spyOn(console, 'log').mockImplementation(jest.fn())
    jest.spyOn(process, 'exit').mockImplementation(jest.fn as never)

    writeThemeFileSpy = writeThemeFile.default as jest.MockedFunction<typeof writeThemeFile.default>
    writeThemeFileSpy.mockResolvedValue(['theme'])
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

      expect(writeThemeFileSpy).toHaveBeenCalledWith(
        OPTS.outDir,
        expect.stringContaining('themizer.config.ts'),
      )
      expect(console.log).toHaveBeenCalledWith(
        `themizer: theme.css written to ${OPTS.outDir} directory`,
      )
    })

    it('shows theme count when multiple themes are generated', async () => {
      writeThemeFileSpy.mockResolvedValue(['cocaCola', 'nike'])

      await themeAction(OPTS)

      expect(console.log).toHaveBeenCalledWith(
        `themizer: theme.css written to ${OPTS.outDir} directory (2 themes: cocaCola, nike)`,
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
