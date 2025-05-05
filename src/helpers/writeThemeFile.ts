import path from 'node:path'
import fs from 'node:fs'

import THEME_FILE_NAME from '../consts/themeFileName'
import THEME_FILE_ENCODING from '../consts/themeFileEncoding'
import THEME_FILE_DIRECTORY from '../consts/themeFileDirectory'
import theme from './theme'

export interface WriteThemeFileParams {
  /**
   * `themizer.css` output directory.
   * @default "src"
   * @example "root", "src/styles", "page/css"
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  outDir?: 'root' | (string & {})
  atoms: string
}

/** TODO: add outDir? param */
export default function writeThemeFile({ outDir = THEME_FILE_DIRECTORY, atoms }: WriteThemeFileParams) {
  if (theme.getAtoms === atoms || process.env.NODE_ENV === 'production') return

  const resolvedPath = path.resolve(
    ...[process.cwd(), outDir === 'root' ? '' : outDir, THEME_FILE_NAME].filter(Boolean),
  )

  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true })
  fs.writeFileSync(resolvedPath, atoms, THEME_FILE_ENCODING)
  theme.setAtoms(fs.readFileSync(resolvedPath, THEME_FILE_ENCODING))
}
