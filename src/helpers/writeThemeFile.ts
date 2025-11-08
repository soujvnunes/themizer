import path from 'node:path'
import fs from 'node:fs'

import THEME_FILE_NAME from '../consts/THEME_FILE_NAME'
import FILE_ENCODING from '../consts/FILE_ENCODING'
import executeConfig from './executeConfig'

/**
 * Executes the themizer config and writes the generated CSS to a theme.css file.
 *
 * @param outDir - Output directory path
 * @param configPath - Path to the themizer config file
 */
export default async function writeThemeFile(outDir: string, configPath: string) {
  const css = await executeConfig(configPath)
  const outputDirectory = path.resolve(process.cwd(), outDir, THEME_FILE_NAME)

  await fs.promises.mkdir(path.dirname(outputDirectory), { recursive: true })
  await fs.promises.writeFile(outputDirectory, css, FILE_ENCODING)
}
