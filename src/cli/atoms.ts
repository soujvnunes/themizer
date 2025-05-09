import { Command } from 'commander'

import writeAtomsFile from '../helpers/writeAtomsFile'

export default async function atoms() {
  const command = new Command()

  command.option('--out-dir <DIR>', 'atoms.css output directory')
  command.parse(process.argv)

  const options = command.opts<{ outDir?: string }>()

  if (!options.outDir) {
    console.error('themizer: Missing output directory argument')
    process.exit()
  }

  try {
    await writeAtomsFile(options.outDir)
    console.log(`themizer: atoms.css written to ${options.outDir} directory`)
  } catch (error) {
    console.error('themizer: Failed to write atoms.css')
    process.exit()
  }
}
