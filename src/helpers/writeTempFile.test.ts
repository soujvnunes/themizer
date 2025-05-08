import fs from 'node:fs'

import TEMP_FILE_NAME from '../consts/TEMP_FILE_NAME'
import FILE_ENCODING from '../consts/FILE_ENCODING'

import writeTempFile from './writeTempFile'
import * as getTempFile from './getTempFile'

describe('writeTempFile', () => {
  const TEMP_DIR = `./${TEMP_FILE_NAME}`

  beforeEach(() => {
    jest.resetModules()
    jest.spyOn(getTempFile, 'default').mockReturnValue(TEMP_DIR)
    jest.spyOn(fs, 'writeFileSync').mockImplementation(jest.fn)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('declaring atoms argument', () => {
    it('writes it on the temporary directory', () => {
      // TODO: what if is an empty string?
      const ATOMS = ':root { --hello: "world"; }'

      writeTempFile(ATOMS)

      expect(getTempFile.default).toHaveBeenCalled()
      expect(getTempFile.default).toHaveReturnedWith(TEMP_DIR)
      expect(fs.writeFileSync).toHaveBeenCalledWith(TEMP_DIR, ATOMS, FILE_ENCODING)
    })
  })
})
