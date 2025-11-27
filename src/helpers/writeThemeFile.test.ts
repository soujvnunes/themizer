import path from 'node:path'
import fs from 'node:fs'

import THEME_FILE_NAME from '../consts/THEME_FILE_NAME'
import FILE_ENCODING from '../consts/FILE_ENCODING'

import executeConfig from './executeConfig'
import writeThemeFile from './writeThemeFile'

jest.mock('./executeConfig')

describe('writeThemeFile', () => {
  const CSS = ':root { --hello: "world"; }'
  const ROOT_DIR = '.'
  const CONFIG_PATH = '/path/to/themizer.config.ts'

  beforeEach(() => {
    jest.resetModules()
    jest.spyOn(process, 'cwd').mockReturnValue(ROOT_DIR)
    jest.spyOn(path, 'resolve').mockImplementation((...args) => args.join('/'))
    jest.spyOn(path, 'dirname').mockImplementation((p) => p.split('/').slice(0, -1).join('/'))
    jest.spyOn(fs.promises, 'mkdir').mockResolvedValue(undefined)
    jest.spyOn(fs.promises, 'writeFile').mockResolvedValue()
    ;(executeConfig as jest.Mock).mockResolvedValue({
      themes: [{ name: 'theme', css: CSS, variableMap: undefined }],
      css: CSS,
      variableMap: undefined,
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('executes config and writes CSS theme at the provided output directory', async () => {
    const OUT_DIR = 'src'

    const result = await writeThemeFile(OUT_DIR, CONFIG_PATH)

    expect(executeConfig).toHaveBeenCalledWith(CONFIG_PATH)
    expect(process.cwd).toHaveBeenCalled()
    expect(process.cwd).toHaveReturnedWith(ROOT_DIR)
    expect(path.resolve).toHaveBeenCalledWith(ROOT_DIR, OUT_DIR, THEME_FILE_NAME)
    expect(fs.promises.mkdir).toHaveBeenCalledWith(`${ROOT_DIR}/${OUT_DIR}`, { recursive: true })
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      `${ROOT_DIR}/${OUT_DIR}/${THEME_FILE_NAME}`,
      CSS,
      FILE_ENCODING,
    )
    expect(result).toEqual(['theme'])
  })

  it('returns array of theme names from multiple themes', async () => {
    const CSS_COMBINED = ':root { --color1: #000; }\n:root { --color2: #fff; }'
    ;(executeConfig as jest.Mock).mockResolvedValue({
      themes: [
        { name: 'cocaCola', css: ':root { --color1: #000; }', variableMap: undefined },
        { name: 'nike', css: ':root { --color2: #fff; }', variableMap: undefined },
      ],
      css: CSS_COMBINED,
      variableMap: undefined,
    })

    const OUT_DIR = 'src'

    const result = await writeThemeFile(OUT_DIR, CONFIG_PATH)

    expect(result).toEqual(['cocaCola', 'nike'])
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      `${ROOT_DIR}/${OUT_DIR}/${THEME_FILE_NAME}`,
      CSS_COMBINED,
      FILE_ENCODING,
    )
  })

  it('writes source map file when variableMap exists', async () => {
    const VARIABLE_MAP = { '--a0': '--theme-color' }
    ;(executeConfig as jest.Mock).mockResolvedValue({
      themes: [{ name: 'theme', css: CSS, variableMap: VARIABLE_MAP }],
      css: CSS,
      variableMap: VARIABLE_MAP,
    })

    const OUT_DIR = 'src'

    await writeThemeFile(OUT_DIR, CONFIG_PATH)

    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      `${ROOT_DIR}/${OUT_DIR}/${THEME_FILE_NAME}.map.json`,
      JSON.stringify(VARIABLE_MAP, null, 2),
      FILE_ENCODING,
    )
  })
})
