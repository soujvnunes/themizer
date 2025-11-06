import path from 'node:path'
import fs from 'node:fs'

import THEME_FILE_NAME from '../consts/THEME_FILE_NAME'
import FILE_ENCODING from '../consts/FILE_ENCODING'

import ThemeTempFile from './ThemeTempFile'

export default async function writeThemeFile(outDir: string) {
  const outputDirectory = path.resolve(process.cwd(), outDir, THEME_FILE_NAME)

  await fs.promises.mkdir(path.dirname(outputDirectory), { recursive: true })
  await fs.promises.writeFile(outputDirectory, await ThemeTempFile.read(), FILE_ENCODING)
}
