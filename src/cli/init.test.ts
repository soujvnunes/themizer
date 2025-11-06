import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { initAction } from './init'
import prompts from 'prompts'
import * as detectFramework from '../helpers/detectFramework'

jest.mock('node:fs')
jest.mock('node:path')
jest.mock('prompts')
jest.mock('../helpers/detectFramework')

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>
const mockWriteFileSync = writeFileSync as jest.MockedFunction<typeof writeFileSync>
const mockJoin = join as jest.MockedFunction<typeof join>
const mockPrompts = prompts as jest.MockedFunction<typeof prompts>
const mockGetFrameworkInfo = detectFramework.getFrameworkInfo as jest.MockedFunction<
  typeof detectFramework.getFrameworkInfo
>
const mockGetFrameworkDisplayName = detectFramework.getFrameworkDisplayName as jest.MockedFunction<
  typeof detectFramework.getFrameworkDisplayName
>

describe('init', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    jest.spyOn(console, 'log').mockImplementation(jest.fn())
    jest.spyOn(process, 'exit').mockImplementation(jest.fn as never)

    mockJoin.mockImplementation((...paths) => paths.join('/'))

    // Default framework detection mocks
    mockGetFrameworkInfo.mockReturnValue({
      framework: 'next-app',
      hasSrcDir: true,
      suggestedPath: './src/app',
    })
    mockGetFrameworkDisplayName.mockReturnValue('Next.js (App Router)')

    // Default prompts mock - user accepts suggested path
    mockPrompts.mockResolvedValue({
      useDetected: true,
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when themizer.config.ts already exists', () => {
    it('exits with error message', async () => {
      mockExistsSync.mockReturnValue(true)

      await initAction({})

      expect(process.exit).toHaveBeenCalledWith(1)
      expect(console.error).toHaveBeenCalledWith('themizer: themizer.config.ts already exists')
      expect(console.log).toHaveBeenCalledWith(
        'themizer: If you want to recreate it, please delete the existing file first',
      )
    })
  })

  describe('when themizer.config.ts does not exist', () => {
    beforeEach(() => {
      mockExistsSync.mockImplementation((path) => {
        // Config doesn't exist, but package.json does
        return String(path).includes('package.json')
      })
    })

    it('creates themizer.config.ts', async () => {
      const packageJson = { scripts: {} }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))

      await initAction({})

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('themizer.config.ts'),
        expect.stringContaining('import themizer from'),
        'utf-8',
      )
      expect(console.log).toHaveBeenCalledWith('themizer: Creating themizer.config.ts...')
      expect(console.log).toHaveBeenCalledWith('themizer: ✓ Created themizer.config.ts')
    })

    it('uses detected framework path when user accepts', async () => {
      const packageJson = { scripts: {} }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))
      mockPrompts.mockResolvedValue({ useDetected: true })

      await initAction({})

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.stringContaining('"themizer:theme": "themizer theme --out-dir ./src/app"'),
        'utf-8',
      )
      expect(console.log).toHaveBeenCalledWith('themizer: ✓ Added "themizer:theme" script to package.json')
    })

    it('uses custom path when user provides it', async () => {
      const packageJson = { scripts: {} }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))
      mockPrompts.mockResolvedValue({ useDetected: false, customPath: './custom/path' })

      await initAction({})

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.stringContaining('"themizer:theme": "themizer theme --out-dir ./custom/path"'),
        'utf-8',
      )
    })

    it('uses --out-dir flag when provided (non-interactive)', async () => {
      const packageJson = { scripts: {} }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))

      await initAction({ outDir: './explicit/path' })

      // Should not call prompts in non-interactive mode
      expect(mockPrompts).not.toHaveBeenCalled()

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.stringContaining('"themizer:theme": "themizer theme --out-dir ./explicit/path"'),
        'utf-8',
      )
    })

    it('adds watch script with detected path', async () => {
      const packageJson = { scripts: {} }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))
      mockPrompts.mockResolvedValue({ useDetected: true })

      await initAction({ watch: true })

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.stringContaining('"themizer:theme:watch": "themizer theme --out-dir ./src/app --watch"'),
        'utf-8',
      )
      expect(console.log).toHaveBeenCalledWith(
        'themizer: ✓ Added "themizer:theme:watch" script to package.json',
      )
    })

    it('does not add script if it already exists', async () => {
      const packageJson = {
        scripts: {
          'themizer:theme': 'existing command',
        },
      }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))

      await initAction({})

      // Should still write config but not modify package.json scripts
      const writeFileCallsToPackageJson = (mockWriteFileSync.mock.calls as unknown[][]).filter((call) =>
        String(call[0]).includes('package.json'),
      )
      expect(writeFileCallsToPackageJson).toHaveLength(0)
      expect(console.log).toHaveBeenCalledWith(
        'themizer: Script "themizer:theme" already exists in package.json',
      )
    })

    it('handles missing package.json gracefully', async () => {
      mockExistsSync.mockImplementation((path) => {
        // Neither config nor package.json exist
        return false
      })

      await initAction({})

      expect(console.log).toHaveBeenCalledWith('themizer: Creating themizer.config.ts...')
      expect(console.log).toHaveBeenCalledWith('themizer: ✓ Created themizer.config.ts')
      // Should not attempt to update package.json
      expect(mockReadFileSync).not.toHaveBeenCalled()
    })

    it('initializes scripts object if package.json has no scripts', async () => {
      const packageJson = {} // No scripts property
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))

      await initAction({})

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.stringContaining('"scripts"'),
        'utf-8',
      )
    })

    it('shows completion message with next steps', async () => {
      const packageJson = { scripts: {} }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))
      mockPrompts.mockResolvedValue({ useDetected: true })

      await initAction({})

      expect(console.log).toHaveBeenCalledWith('themizer: Initialization complete! 🎉')
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Next steps:'))
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Customize your tokens'))
    })

    it('displays detected framework information in interactive mode', async () => {
      const packageJson = { scripts: {} }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))
      mockPrompts.mockResolvedValue({ useDetected: true })

      await initAction({})

      expect(console.log).toHaveBeenCalledWith('Detected framework: Next.js (App Router)')
      expect(console.log).toHaveBeenCalledWith('Suggested output directory: ./src/app')
    })

    it('exits gracefully when user cancels prompts', async () => {
      const packageJson = { scripts: {} }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))
      mockPrompts.mockResolvedValue({ useDetected: undefined })

      await initAction({})

      expect(process.exit).toHaveBeenCalledWith(0)
      expect(console.log).toHaveBeenCalledWith('themizer: Initialization cancelled')
    })

    it('handles errors gracefully', async () => {
      mockExistsSync.mockReturnValue(false)
      mockWriteFileSync.mockImplementation(() => {
        throw new Error('Write failed')
      })

      await initAction({})

      expect(process.exit).toHaveBeenCalledWith(1)
      expect(console.error).toHaveBeenCalledWith('themizer: Failed to initialize - Write failed')
    })
  })
})
