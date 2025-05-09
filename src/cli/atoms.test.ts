import * as writeAtomsFile from '../helpers/writeAtomsFile'

import atoms from './atoms'

describe('atoms', () => {
  const ARGV = process.argv
  const OUT_DIR = './src'
  const OPTS = { outDir: OUT_DIR }

  let writeAtomsFileSpy: jest.SpyInstance

  beforeEach(() => {
    writeAtomsFileSpy = jest.spyOn(writeAtomsFile, 'default').mockImplementation(jest.fn())

    jest.resetModules()
    jest.resetAllMocks()
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    jest.spyOn(console, 'log').mockImplementation(jest.fn())
    jest.spyOn(process, 'exit').mockImplementation(jest.fn as (code?: number | string | null) => never)
    jest.mock('commander', () => ({
      Command: jest.fn().mockImplementation(() => ({
        option: jest.fn().mockReturnThis(),
        parse: jest.fn().mockReturnThis(),
        opts: jest.fn().mockReturnValue(OPTS),
      })),
    }))
  })

  afterEach(() => {
    jest.restoreAllMocks()

    process.argv = ARGV
  })

  function renderArgv() {
    process.argv = ['', '', '--out-dir', OPTS.outDir]
  }

  it('exits when ran without options', async () => {
    await atoms()

    expect(process.exit).toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith('themizer: Missing output directory argument')
  })
  it('writes atoms file to the provided output directory as option', async () => {
    renderArgv()
    await atoms()

    expect(writeAtomsFile.default).toHaveBeenLastCalledWith(OPTS.outDir)
    expect(console.log).toHaveBeenCalledWith(`themizer: atoms.css written to ${OPTS.outDir} directory`)
  })
  it('exits and throw when encounter a writing error', async () => {
    renderArgv()
    writeAtomsFileSpy.mockRejectedValue(new Error('Error'))
    await atoms()

    expect(console.error).toHaveBeenCalledWith('themizer: Failed to write atoms.css')
    expect(process.exit).toHaveBeenCalled()
  })
})
