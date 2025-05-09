import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

import TEMP_FILE_NAME from '../consts/ATOMS_TEMP_FILE_NAME'
import FILE_ENCODING from '../consts/FILE_ENCODING'

import AtomsTempFile from './AtomsTempFile'

describe('AtomsTempFile', () => {
  const TEMP_DIR = '.'
  const TEMP_FILE = `${TEMP_DIR}/${TEMP_FILE_NAME}`
  const ATOMS = ':root { --hello: "world"; }'

  beforeEach(() => {
    jest.resetModules()
    jest.spyOn(os, 'tmpdir').mockReturnValue(TEMP_DIR)
    jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'))
    jest.spyOn(fs, 'writeFileSync').mockImplementation(jest.fn)
    jest.spyOn(fs.promises, 'readFile').mockResolvedValue(ATOMS)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  function expectPath(_tempFile: string) {
    expect(os.tmpdir).toHaveBeenCalled()
    expect(os.tmpdir).toHaveReturnedWith('.')
    expect(path.join).toHaveBeenCalledWith(TEMP_DIR, TEMP_FILE_NAME)
    expect(path.join).toHaveReturnedWith(_tempFile)
  }

  it('writes atoms corretly', () => {
    AtomsTempFile.write(ATOMS)

    expectPath(TEMP_FILE)
    expect(fs.writeFileSync).toHaveBeenCalledWith(TEMP_FILE, ATOMS, FILE_ENCODING)
  })
  it('reads atoms corretly', async () => {
    const atoms = await AtomsTempFile.read()

    expectPath(TEMP_FILE)
    expect(atoms).toBe(ATOMS)
    expect(fs.promises.readFile).toHaveBeenCalledWith(TEMP_FILE, FILE_ENCODING)
  })
})
