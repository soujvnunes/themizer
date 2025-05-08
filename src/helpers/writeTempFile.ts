import fs from 'node:fs'

import FILE_ENCODING from '../consts/FILE_ENCODING'

import getTempFile from './getTempFile'

export default function writeTempFile(atoms: string) {
  const tempFileDir = getTempFile()

  fs.writeFileSync(tempFileDir, atoms, FILE_ENCODING)
}
