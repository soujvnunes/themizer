import { Command } from 'commander'
import { watch } from 'chokidar'
import { join } from 'node:path'
import writeThemeFile from '../helpers/writeThemeFile'
import { validateFilePath } from '../lib/validators'

export async function themeAction(options: { outDir?: string; watch?: boolean }) {
  if (!options.outDir) {
    console.error('themizer: Missing output directory argument for the theme command')
    process.exit(1)
  }

  try {
    validateFilePath(options.outDir)
    await writeThemeFile(options.outDir)
    console.log(`themizer: theme.css written to ${options.outDir} directory`)

    if (options.watch) {
      const configPath = join(process.cwd(), 'themizer.config.ts')
      const outDir = options.outDir // Capture for use in callbacks
      console.log('themizer: Watching for changes to themizer.config.ts...')
      console.log('themizer: Press Ctrl+C to stop watching')

      const watcher = watch(configPath, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50,
        },
      })

      watcher.on('change', async () => {
        console.log('')
        console.log('themizer: Config file changed, regenerating theme.css...')
        try {
          await writeThemeFile(outDir)
          console.log(`themizer: ✓ theme.css regenerated successfully`)
        } catch (error) {
          console.error(`themizer: Failed to regenerate theme.css - ${(error as Error).message}`)
        }
      })

      watcher.on('error', (error) => {
        if (error instanceof Error) console.error(`themizer: Watcher error - ${error.message}`)
      })

      // Keep process alive
      process.stdin.resume()
    }
  } catch (error) {
    console.error(`themizer: Failed to write theme.css - ${(error as Error).message}`)
    process.exit(1)
  }
}

const command = new Command('theme')

command
  .description('Generate theme.css file from your themizer configuration')
  .option('--out-dir <DIR>', 'Output directory for theme.css file (required)')
  .option('--watch', 'Watch for changes to themizer.config.ts and regenerate theme.css automatically')
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
  $ themizer theme --out-dir ./src/app --watch

Watch Mode:
  Use the --watch flag to automatically regenerate theme.css whenever
  themizer.config.ts changes. This is useful during development.

Note:
  You must first set up your themizer configuration in your TypeScript code
  before running this command. See the documentation for setup instructions.
`,
  )
  .action(themeAction)

export default command
