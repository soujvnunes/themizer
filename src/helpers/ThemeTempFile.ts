import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

import TEMP_FILE_NAME from '../consts/THEME_TEMP_FILE_NAME'
import FILE_ENCODING from '../consts/FILE_ENCODING'

export default class ThemeTempFile {
  private static cleanupRegistered = false

  private static get file() {
    return path.join(os.tmpdir(), TEMP_FILE_NAME)
  }

  static write(css: string) {
    fs.writeFileSync(this.file, css, FILE_ENCODING)

    // Register cleanup handlers on first write
    if (!this.cleanupRegistered) {
      this.cleanupRegistered = true
      this.registerCleanupHandlers()
    }
  }

  static read() {
    return fs.promises.readFile(this.file, FILE_ENCODING)
  }

  static cleanup() {
    try {
      if (fs.existsSync(this.file)) {
        fs.unlinkSync(this.file)
      }
    } catch (error) {
      // Silently ignore cleanup errors
      // The OS will eventually clean up temp files anyway
    }
  }

  private static registerCleanupHandlers() {
    // Clean up on normal exit
    process.on('exit', () => {
      this.cleanup()
    })

    // Clean up on SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      this.cleanup()
      process.exit(130) // Standard exit code for SIGINT
    })

    // Clean up on SIGTERM
    process.on('SIGTERM', () => {
      this.cleanup()
      process.exit(143) // Standard exit code for SIGTERM
    })

    // Note: We don't handle uncaughtException here to avoid masking errors
    // and interfering with Node.js's default error handling behavior.
    // The OS will clean up temp files eventually if cleanup doesn't run.
  }
}
