import path from 'node:path'
import fs from 'node:fs'

export const FILE_NAME = 'theme.css'
export const BUFFER_ENCONDIG = 'utf-8'

let currentCss = ''

export default function writeThemeFile(css: string) {
  if (!!currentCss && css === currentCss) return

  const packageRootDir = process.cwd()
  const resolvedPath = path.resolve(packageRootDir, FILE_NAME)

  fs.writeFileSync(resolvedPath, css, BUFFER_ENCONDIG)

  currentCss = fs.readFileSync(resolvedPath, BUFFER_ENCONDIG)
}
