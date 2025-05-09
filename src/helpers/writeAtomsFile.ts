import path from 'node:path'
import fs from 'node:fs'

import ATOMS_FILE_NAME from '../consts/ATOMS_FILE_NAME'
import FILE_ENCODING from '../consts/FILE_ENCODING'

import AtomsTempFile from './AtomsTempFile'

export default async function writeAtomsFile(outDir: string) {
  const outputDirectory = path.resolve(process.cwd(), outDir, ATOMS_FILE_NAME)
  const tempAtoms = await AtomsTempFile.read()

  await fs.promises.mkdir(path.dirname(outputDirectory), { recursive: true })
  await fs.promises.writeFile(outputDirectory, tempAtoms, FILE_ENCODING)
}
