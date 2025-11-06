import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

import TEMP_FILE_NAME from '../consts/THEME_TEMP_FILE_NAME'
import FILE_ENCODING from '../consts/FILE_ENCODING'

export default class ThemeTempFile {
  private static cleanupRegistered = false
  private static exitHandler = () => ThemeTempFile.cleanup()
  private static sigintHandler = () => {
    ThemeTempFile.cleanup()
    process.exit(130) // Standard exit code for SIGINT
  }
  private static sigtermHandler = () => {
    ThemeTempFile.cleanup()
    process.exit(143) // Standard exit code for SIGTERM
  }

  private static get file() {
    return path.join(os.tmpdir(), TEMP_FILE_NAME)
  }

  static write(css: string) {
    fs.writeFileSync(this.file, css, FILE_ENCODING)

    // Register cleanup handlers on first write
    // Note: While setting cleanupRegistered after writeFileSync creates a theoretical race
    // window, this is not a practical concern in Node.js because:
    // 1. writeFileSync is blocking (synchronous)
    // 2. Flag update and handler registration happen in the same event loop tick
    // 3. Process exit events cannot fire until control returns to the event loop
    // 4. If the process crashes before handlers are registered, the OS will clean up temp files
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

  /**
   * Resets the cleanup registration state and removes all handlers.
   * This is primarily for testing purposes to ensure test isolation.
   */
  static resetForTesting() {
    this.cleanupRegistered = false
    process.removeListener('exit', this.exitHandler)
    process.removeListener('SIGINT', this.sigintHandler)
    process.removeListener('SIGTERM', this.sigtermHandler)
  }

  private static registerCleanupHandlers() {
    // Remove any existing handlers first (important for test environments)
    process.removeListener('exit', this.exitHandler)
    process.removeListener('SIGINT', this.sigintHandler)
    process.removeListener('SIGTERM', this.sigtermHandler)

    // Register cleanup handlers using named functions for proper removal
    process.on('exit', this.exitHandler)
    process.on('SIGINT', this.sigintHandler)
    process.on('SIGTERM', this.sigtermHandler)

    // Note: We don't handle uncaughtException here to avoid masking errors
    // and interfering with Node.js's default error handling behavior.
    // The OS will clean up temp files eventually if cleanup doesn't run.
  }
}
