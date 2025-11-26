import { pathToFileURL } from 'node:url'
import executeConfig from './executeConfig'
import INTERNAL from '../consts/INTERNAL'

const mockImportModule = jest.fn()

describe('executeConfig', () => {
  const mockConfigPath = '/path/to/themizer.config.ts'
  const mockCSS1 = ':root{--color-primary:#000;}'
  const mockCSS2 = ':root{--color-secondary:#fff;}'
  const mockJSS = { ':root': { '--color-primary': '#000' } }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('imports config file with single named export and returns themes, css, and variableMap', async () => {
    const mockModule = {
      theme: {
        [INTERNAL]: {
          rules: {
            css: mockCSS1,
            jss: mockJSS,
          },
          variableMap: { '--a0': '--theme-tokens-color-primary' },
        },
        aliases: {},
        tokens: {},
        medias: {},
      },
    }

    // Mock dynamic import
    mockImportModule.mockResolvedValue(mockModule)

    const result = await executeConfig(mockConfigPath, mockImportModule)

    expect(result).toEqual({
      themes: [
        {
          name: 'theme',
          css: mockCSS1,
          variableMap: { '--a0': '--theme-tokens-color-primary' },
        },
      ],
      css: mockCSS1,
      variableMap: { '--a0': '--theme-tokens-color-primary' },
    })
  })

  it('imports config file with multiple named exports and combines CSS', async () => {
    const mockModule = {
      cocaCola: {
        [INTERNAL]: {
          rules: { css: mockCSS1, jss: mockJSS },
          variableMap: { '--a0': '--coke-color-primary' },
        },
      },
      nike: {
        [INTERNAL]: {
          rules: { css: mockCSS2, jss: mockJSS },
          variableMap: { '--b0': '--nike-color-secondary' },
        },
      },
    }

    mockImportModule.mockResolvedValue(mockModule)

    const result = await executeConfig(mockConfigPath, mockImportModule)

    expect(result.themes).toHaveLength(2)
    expect(result.themes[0]).toEqual({
      name: 'cocaCola',
      css: mockCSS1,
      variableMap: { '--a0': '--coke-color-primary' },
    })
    expect(result.themes[1]).toEqual({
      name: 'nike',
      css: mockCSS2,
      variableMap: { '--b0': '--nike-color-secondary' },
    })
    expect(result.css).toBe(`${mockCSS1}\n${mockCSS2}`)
    expect(result.variableMap).toEqual({
      '--a0': '--coke-color-primary',
      '--b0': '--nike-color-secondary',
    })
  })

  it('merges variable maps from multiple themes', async () => {
    const mockModule = {
      theme1: {
        [INTERNAL]: {
          rules: { css: mockCSS1 },
          variableMap: { '--a0': '--theme1-var' },
        },
      },
      theme2: {
        [INTERNAL]: {
          rules: { css: mockCSS2 },
          variableMap: { '--b0': '--theme2-var' },
        },
      },
    }

    mockImportModule.mockResolvedValue(mockModule)

    const result = await executeConfig(mockConfigPath, mockImportModule)

    expect(result.variableMap).toEqual({
      '--a0': '--theme1-var',
      '--b0': '--theme2-var',
    })
  })

  it('warns when variable maps have colliding minified names', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

    const mockModule = {
      theme1: {
        [INTERNAL]: {
          rules: { css: mockCSS1 },
          variableMap: { '--a0': '--theme1-color' },
        },
      },
      theme2: {
        [INTERNAL]: {
          rules: { css: mockCSS2 },
          variableMap: { '--a0': '--theme2-color' },
        },
      },
    }

    mockImportModule.mockResolvedValue(mockModule)
    await executeConfig(mockConfigPath, mockImportModule)

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Variable map collision'))
    consoleSpy.mockRestore()
  })

  it('returns undefined variableMap when no themes have variable maps', async () => {
    const mockModule = {
      theme: {
        [INTERNAL]: {
          rules: { css: mockCSS1 },
        },
      },
    }

    mockImportModule.mockResolvedValue(mockModule)

    const result = await executeConfig(mockConfigPath, mockImportModule)

    expect(result.variableMap).toBeUndefined()
  })

  it('converts file path to file:// URL with cache busting timestamp', async () => {
    const mockModule = {
      theme: {
        [INTERNAL]: {
          rules: { css: mockCSS1, jss: mockJSS },
        },
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

  it('skips default export - only named exports are supported', async () => {
    const mockModule = {
      default: {
        [INTERNAL]: {
          rules: { css: mockCSS1 },
          variableMap: { '--a0': '--default-var' },
        },
      },
      theme: {
        [INTERNAL]: {
          rules: { css: mockCSS2 },
          variableMap: { '--b0': '--theme-var' },
        },
      },
    }

    mockImportModule.mockResolvedValue(mockModule)

    const result = await executeConfig(mockConfigPath, mockImportModule)

    expect(result.themes).toHaveLength(1)
    expect(result.themes[0].name).toBe('theme')
    expect(result.css).toBe(mockCSS2)
  })

  it('skips invalid exports that do not have rules.css', async () => {
    const mockModule = {
      theme: {
        [INTERNAL]: {
          rules: { css: mockCSS1 },
        },
      },
      invalidExport1: {
        [INTERNAL]: {
          rules: {},
        },
      },
      invalidExport2: {
        aliases: {},
      },
      someOtherExport: 'not an object',
    }

    mockImportModule.mockResolvedValue(mockModule)

    const result = await executeConfig(mockConfigPath, mockImportModule)

    expect(result.themes).toHaveLength(1)
    expect(result.themes[0].name).toBe('theme')
  })

  it('throws error when config has no valid theme exports', async () => {
    const mockModule = {
      default: {
        [INTERNAL]: {
          rules: { css: mockCSS1 },
        },
      },
    }

    mockImportModule.mockResolvedValue(mockModule)

    await expect(executeConfig(mockConfigPath, mockImportModule)).rejects.toThrow(
      'themizer [config]: No valid theme exports found. Use named exports: export const theme = themizer(...)',
    )
  })

  it('throws error when config has no exports at all', async () => {
    const mockModule = {}

    mockImportModule.mockResolvedValue(mockModule)

    await expect(executeConfig(mockConfigPath, mockImportModule)).rejects.toThrow(
      'No valid theme exports found',
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
