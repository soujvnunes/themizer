import { pathToFileURL } from 'node:url'
import executeConfig from './executeConfig'

const mockImportModule = jest.fn()

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

  it('imports config file and returns rules.css and variableMap', async () => {
    const mockModule = {
      default: {
        rules: {
          css: mockCSS,
          jss: mockJSS,
        },
        aliases: {},
        tokens: {},
        medias: {},
        variableMap: { '--a0': '--theme-tokens-color-primary' },
      },
    }

    // Mock dynamic import
    mockImportModule.mockResolvedValue(mockModule)

    const result = await executeConfig(mockConfigPath, mockImportModule)

    expect(result).toEqual({
      css: mockCSS,
      variableMap: { '--a0': '--theme-tokens-color-primary' },
    })
  })

  it('converts file path to file:// URL with cache busting timestamp', async () => {
    const mockModule = {
      default: {
        rules: { css: mockCSS, jss: mockJSS },
      },
    }

    mockImportModule.mockResolvedValue(mockModule)

    await executeConfig(mockConfigPath, mockImportModule)

    const expectedUrl = pathToFileURL(mockConfigPath).href
    const callArg = (mockImportModule.mock.calls[0] as string[])[0]

    expect(callArg).toMatch(
      new RegExp(`^${expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?t=\\d+$`),
    )
  })

  it('throws error when config does not export default', async () => {
    const mockModule = {}

    mockImportModule.mockResolvedValue(mockModule)

    await expect(executeConfig(mockConfigPath, mockImportModule)).rejects.toThrow(
      'themizer: Config file must export a theme object with rules.css property',
    )
  })

  it('throws error when config default does not have rules', async () => {
    const mockModule = {
      default: {
        aliases: {},
        tokens: {},
      },
    }

    mockImportModule.mockResolvedValue(mockModule)

    await expect(executeConfig(mockConfigPath, mockImportModule)).rejects.toThrow(
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

    mockImportModule.mockResolvedValue(mockModule)

    await expect(executeConfig(mockConfigPath, mockImportModule)).rejects.toThrow(
      'Config file must export a theme object with rules.css property',
    )
  })

  it('wraps import errors with helpful message', async () => {
    const originalError = new Error('Module not found')

    mockImportModule.mockRejectedValue(originalError)

    await expect(executeConfig(mockConfigPath, mockImportModule)).rejects.toThrow(
      'Failed to execute config file: Module not found',
    )
  })

  it('preserves non-Error thrown values', async () => {
    mockImportModule.mockRejectedValue('string error')

    await expect(executeConfig(mockConfigPath, mockImportModule)).rejects.toBe('string error')
  })
})
