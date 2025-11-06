import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

import TEMP_FILE_NAME from '../consts/THEME_TEMP_FILE_NAME'
import FILE_ENCODING from '../consts/FILE_ENCODING'

import ThemeTempFile from './ThemeTempFile'

describe('ThemeTempFile', () => {
  const TEMP_DIR = '.'
  const TEMP_FILE = `${TEMP_DIR}/${TEMP_FILE_NAME}`
  const CSS = ':root { --hello: "world"; }'

  beforeEach(() => {
    jest.resetModules()
    jest.spyOn(os, 'tmpdir').mockReturnValue(TEMP_DIR)
    jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'))
    jest.spyOn(fs, 'writeFileSync').mockImplementation(jest.fn)
    jest.spyOn(fs.promises, 'readFile').mockResolvedValue(CSS)
  })

  afterEach(() => {
    ThemeTempFile.resetForTesting()
    jest.restoreAllMocks()
  })

  function expectPath(tempFile: string) {
    expect(os.tmpdir).toHaveBeenCalled()
    expect(os.tmpdir).toHaveReturnedWith(TEMP_DIR)
    expect(path.join).toHaveReturnedWith(tempFile)
    expect(path.join).toHaveBeenCalledWith(TEMP_DIR, TEMP_FILE_NAME)
  }

  it('writes CSS correctly', () => {
    ThemeTempFile.write(CSS)

    expectPath(TEMP_FILE)
    expect(fs.writeFileSync).toHaveBeenCalledWith(TEMP_FILE, CSS, FILE_ENCODING)
  })
  it('reads CSS correctly', async () => {
    const css = await ThemeTempFile.read()

    expectPath(TEMP_FILE)
    expect(css).toBe(CSS)
    expect(fs.promises.readFile).toHaveBeenCalledWith(TEMP_FILE, FILE_ENCODING)
  })
})
