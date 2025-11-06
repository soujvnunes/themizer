import { Command } from 'commander'
import writeThemeFile from '../helpers/writeThemeFile'
import { validateFilePath } from '../lib/validators'

export async function themeAction(options: { outDir?: string }) {
  if (!options.outDir) {
    console.error('themizer: Missing output directory argument for the theme command')
    process.exit(1)
  }

  try {
    validateFilePath(options.outDir)
    await writeThemeFile(options.outDir)
    console.log(`themizer: theme.css written to ${options.outDir} directory`)
  } catch (error) {
    console.error(`themizer: Failed to write theme.css - ${(error as Error).message}`)
    process.exit(1)
  }
}

const command = new Command('theme')

command
  .description('Generate theme.css file from your themizer configuration')
  .option('--out-dir <DIR>', 'Output directory for theme.css file (required)')
  .addHelpText(
    'after',
    `
Description:
  Reads the generated CSS from your themizer configuration and writes it to
  a theme.css file in the specified directory. This file contains all your
  CSS custom properties with responsive media queries.

Example:
  $ themizer theme --out-dir ./src/app
  $ themizer theme --out-dir ./app/styles

Note:
  You must first set up your themizer configuration in your TypeScript code
  before running this command. See the documentation for setup instructions.
`,
  )
  .action(themeAction)

export default command
