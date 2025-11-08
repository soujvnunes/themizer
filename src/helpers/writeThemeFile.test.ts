import path from 'node:path'
import fs from 'node:fs'

import THEME_FILE_NAME from '../consts/THEME_FILE_NAME'
import FILE_ENCODING from '../consts/FILE_ENCODING'

import ThemeTempFile from './ThemeTempFile'
import writeThemeFile from './writeThemeFile'

describe('writeThemeFile', () => {
  const CSS = ':root { --hello: "world"; }'
  const ROOT_DIR = '.'

  beforeEach(() => {
    jest.resetModules()
    jest.spyOn(process, 'cwd').mockReturnValue(ROOT_DIR)
    jest.spyOn(path, 'resolve').mockImplementation((...args) => args.join('/'))
    jest.spyOn(ThemeTempFile, 'read').mockResolvedValue(CSS)
    jest.spyOn(fs.promises, 'mkdir').mockImplementation(jest.fn())
    jest.spyOn(fs.promises, 'writeFile').mockImplementation(jest.fn())
  })

  afterEach(() => {
    ThemeTempFile.resetForTesting()
    jest.restoreAllMocks()
  })

  it('writes CSS theme at the provided output directory', async () => {
    const OUT_DIR = 'src'

    await writeThemeFile(OUT_DIR)

    expect(process.cwd).toHaveReturnedWith(ROOT_DIR)
    expect(path.resolve).toHaveBeenCalledWith(ROOT_DIR, OUT_DIR, THEME_FILE_NAME)
    expect(fs.promises.mkdir).toHaveBeenCalled()
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      `${ROOT_DIR}/${OUT_DIR}/${THEME_FILE_NAME}`,
      CSS,
      FILE_ENCODING,
    )
  })
})
