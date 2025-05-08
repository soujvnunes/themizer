import path from 'node:path'
import fs from 'node:fs'

import ATOMS_FILE_NAME from '../consts/ATOMS_FILE_NAME'
import FILE_ENCODING from '../consts/FILE_ENCODING'

import AtomsTempFile from './AtomsTempFile'
import writeAtomsFile from './writeAtomsFile'

describe('writeAtomsFile', () => {
  const ATOMS = ':root { --hello: "world"; }'
  const ROOT_DIR = '.'

  beforeEach(() => {
    jest.resetModules()
    jest.spyOn(process, 'cwd').mockReturnValue(ROOT_DIR)
    jest.spyOn(path, 'resolve').mockImplementation((...args) => args.join('/'))
    jest.spyOn(AtomsTempFile, 'read').mockResolvedValue(ATOMS)
    jest.spyOn(fs.promises, 'mkdir').mockImplementation(jest.fn())
    jest.spyOn(fs.promises, 'writeFile').mockImplementation(jest.fn())
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('writes atoms in the CSS at the provided output directory', async () => {
    const OUT_DIR = 'src'

    await writeAtomsFile(OUT_DIR)

    expect(process.cwd).toHaveReturnedWith(ROOT_DIR)
    expect(path.resolve).toHaveBeenCalledWith(ROOT_DIR, OUT_DIR, ATOMS_FILE_NAME)
    expect(fs.promises.mkdir).toHaveBeenCalled()
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      `${ROOT_DIR}/${OUT_DIR}/${ATOMS_FILE_NAME}`,
      ATOMS,
      FILE_ENCODING,
    )
  })
})
