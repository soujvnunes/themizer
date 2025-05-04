import path from 'node:path'
import fs from 'node:fs'

import THEME_FILE_NAME from '../consts/themeFileName'
import THEME_FILE_ENCODING from '../consts/themeFileEncoding'
import THEME_FILE_DIRECTORY from '../consts/themeFileDirectory'

export let currentCss = ''

/** TODO: add outDir? param */
export default function writeThemeFile(css: string) {
  if (!!currentCss && css === currentCss) return

  const resolvedPath = path.resolve(process.cwd(), THEME_FILE_DIRECTORY, THEME_FILE_NAME)

  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true })
  fs.writeFileSync(resolvedPath, css, THEME_FILE_ENCODING)

  currentCss = fs.readFileSync(resolvedPath, THEME_FILE_ENCODING)
}
