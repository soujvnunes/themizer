import path from 'node:path'
import os from 'node:os'

import TEMP_FILE_NAME from '../consts/TEMP_FILE_NAME'

import getTempFile from './getTempFile'

describe('getTempFile', () => {
  const TEMP_DIR = '.'

  beforeEach(() => {
    jest.resetModules()
    jest.spyOn(os, 'tmpdir').mockReturnValue(TEMP_DIR)
    jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns the temporary file directory', () => {
    const tempFile = `${TEMP_DIR}/${TEMP_FILE_NAME}`

    expect(getTempFile()).toBe(tempFile)
    expect(os.tmpdir).toHaveBeenCalled()
    expect(os.tmpdir).toHaveReturnedWith('.')
    expect(path.join).toHaveBeenCalledWith(TEMP_DIR, TEMP_FILE_NAME)
    expect(path.join).toHaveReturnedWith(tempFile)
  })
})
