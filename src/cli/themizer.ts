import { Command } from 'commander'

import theme from './theme'
import init from './init'

// Version is imported from package.json at build time
const VERSION = '1.3.0'

export default async function cli() {
  const command = new Command('themizer')

  command
    .version(VERSION, '-v, --version', 'Output the current version')
    .description(
      'Generate CSS custom properties from TypeScript design tokens with responsive media query support',
    )
    .addHelpText(
      'after',
      `
Examples:
  $ themizer theme --out-dir ./src/app
  $ themizer init --watch

Documentation:
  https://github.com/soujvnunes/themizer#readme

Report issues:
  https://github.com/soujvnunes/themizer/issues
`,
    )
    .addCommand(init)
    .addCommand(theme)

  await command.parseAsync(process.argv)
}
