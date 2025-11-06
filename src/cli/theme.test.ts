import * as writeThemeFile from '../helpers/writeThemeFile'

import { themeAction } from './theme'

describe('theme', () => {
  const OPTS = { outDir: './src' }

  let writeThemeFileSpy: jest.SpyInstance

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    jest.spyOn(console, 'log').mockImplementation(jest.fn())
    jest.spyOn(process, 'exit').mockImplementation(jest.fn as never)

    writeThemeFileSpy = jest.spyOn(writeThemeFile, 'default').mockImplementation(jest.fn())
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
  describe('called with options', () => {
    it('writes theme to the output directory file', async () => {
      await themeAction(OPTS)

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
