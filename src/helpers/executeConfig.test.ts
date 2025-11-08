import { pathToFileURL } from 'node:url'
import executeConfig from './executeConfig'

describe('executeConfig', () => {
  const mockConfigPath = '/path/to/themizer.config.ts'
  const mockCSS = ':root{--color-primary:#000;}'
  const mockJSS = { ':root': { '--color-primary': '#000' } }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('imports config file and returns rules.css', async () => {
    const mockModule = {
      default: {
        rules: {
          css: mockCSS,
          jss: mockJSS,
        },
        aliases: {},
        tokens: {},
        medias: {},
      },
    }

    // Mock dynamic import
    jest.spyOn(global, 'import' as never).mockResolvedValue(mockModule as never)

    const result = await executeConfig(mockConfigPath)

    expect(result).toBe(mockCSS)
  })

  it('converts file path to file:// URL with cache busting timestamp', async () => {
    const mockModule = {
      default: {
        rules: { css: mockCSS, jss: mockJSS },
      },
    }

    const importSpy = jest.spyOn(global, 'import' as never).mockResolvedValue(mockModule as never)

    await executeConfig(mockConfigPath)

    // Verify pathToFileURL was used and timestamp was added
    const expectedUrl = pathToFileURL(mockConfigPath).href
    const callArg = (importSpy.mock.calls[0] as string[])[0]

    expect(callArg).toMatch(new RegExp(`^${expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?t=\\d+$`))
  })

  it('throws error when config does not export default', async () => {
    const mockModule = {}

    jest.spyOn(global, 'import' as never).mockResolvedValue(mockModule as never)

    await expect(executeConfig(mockConfigPath)).rejects.toThrow(
      'Failed to execute config file: Config file must export a theme object with rules.css property',
    )
  })

  it('throws error when config default does not have rules', async () => {
    const mockModule = {
      default: {
        aliases: {},
        tokens: {},
      },
    }

    jest.spyOn(global, 'import' as never).mockResolvedValue(mockModule as never)

    await expect(executeConfig(mockConfigPath)).rejects.toThrow(
      'Config file must export a theme object with rules.css property',
    )
  })

  it('throws error when config default.rules does not have css', async () => {
    const mockModule = {
      default: {
        rules: {
          jss: mockJSS,
        },
      },
    }

    jest.spyOn(global, 'import' as never).mockResolvedValue(mockModule as never)

    await expect(executeConfig(mockConfigPath)).rejects.toThrow(
      'Config file must export a theme object with rules.css property',
    )
  })

  it('wraps import errors with helpful message', async () => {
    const originalError = new Error('Module not found')

    jest.spyOn(global, 'import' as never).mockRejectedValue(originalError as never)

    await expect(executeConfig(mockConfigPath)).rejects.toThrow(
      'Failed to execute config file: Module not found',
    )
  })

  it('preserves non-Error thrown values', async () => {
    jest.spyOn(global, 'import' as never).mockRejectedValue('string error' as never)

    await expect(executeConfig(mockConfigPath)).rejects.toBe('string error')
  })
})
