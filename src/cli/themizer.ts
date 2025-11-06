import { Command } from 'commander'

import theme from './theme'
import init from './init'

// Version is injected at build time via tsup define
declare const __VERSION__: string
const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : '0.0.0'

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
