import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

import TEMP_FILE_NAME from '../consts/ATOMS_TEMP_FILE_NAME'
import FILE_ENCODING from '../consts/FILE_ENCODING'

export default class AtomsTempFile {
  private static get file() {
    return path.join(os.tmpdir(), TEMP_FILE_NAME)
  }

  static write(atoms: string) {
    fs.writeFileSync(this.file, atoms, FILE_ENCODING)
  }

  static read() {
    return fs.promises.readFile(this.file, FILE_ENCODING)
  }
}
