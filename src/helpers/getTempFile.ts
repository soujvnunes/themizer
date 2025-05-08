import path from 'node:path'
import os from 'node:os'

import TEMP_FILE_NAME from '../consts/TEMP_FILE_NAME'

export default function getTempFile() {
  return path.join(os.tmpdir(), TEMP_FILE_NAME)
}
