import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  detectFramework,
  hasSrcDirectory,
  generateSuggestedPath,
  getFrameworkInfo,
  getFrameworkDisplayName,
  type Framework,
} from './detectFramework'

jest.mock('node:fs')
jest.mock('node:path')

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>
const mockJoin = join as jest.MockedFunction<typeof join>

describe('detectFramework', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockJoin.mockImplementation((...paths) => paths.join('/'))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('detectFramework', () => {
    it('detects Next.js App Router', () => {
      mockExistsSync.mockImplementation((path) => {
        const pathStr = String(path)
        if (pathStr.includes('package.json')) return true
        if (pathStr.includes('app')) return true
        return false
      })

      const packageJson = {
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
        },
      }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))

      expect(detectFramework()).toBe('next-app')
    })

    it('detects Next.js Pages Router for version < 13', () => {
      mockExistsSync.mockReturnValue(true)

      const packageJson = {
        dependencies: {
          next: '^12.0.0',
          react: '^18.0.0',
        },
      }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))

      expect(detectFramework()).toBe('next-pages')
    })

    it('detects Next.js Pages Router when no app directory exists', () => {
      mockExistsSync.mockImplementation((path) => {
        const pathStr = String(path)
        if (pathStr.includes('package.json')) return true
        if (pathStr.includes('app')) return false
        return false
      })

      const packageJson = {
        dependencies: {
          next: '^13.0.0',
          react: '^18.0.0',
        },
      }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))

      expect(detectFramework()).toBe('next-pages')
    })

    it('detects Remix', () => {
      mockExistsSync.mockReturnValue(true)

      const packageJson = {
        dependencies: {
          '@remix-run/react': '^2.0.0',
          '@remix-run/node': '^2.0.0',
        },
      }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))

      expect(detectFramework()).toBe('remix')
    })

    it('detects Vite', () => {
      mockExistsSync.mockReturnValue(true)

      const packageJson = {
        devDependencies: {
          vite: '^5.0.0',
          react: '^18.0.0',
        },
      }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))

      expect(detectFramework()).toBe('vite')
    })

    it('detects Create React App', () => {
      mockExistsSync.mockReturnValue(true)

      const packageJson = {
        dependencies: {
          'react-scripts': '^5.0.0',
        },
      }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))

      expect(detectFramework()).toBe('create-react-app')
    })

    it('returns other for unknown frameworks', () => {
      mockExistsSync.mockReturnValue(true)

      const packageJson = {
        dependencies: {
          react: '^18.0.0',
        },
      }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))

      expect(detectFramework()).toBe('other')
    })

    it('returns other when package.json does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      expect(detectFramework()).toBe('other')
    })

    it('returns other when package.json is invalid', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('invalid json')

      expect(detectFramework()).toBe('other')
    })
  })

  describe('hasSrcDirectory', () => {
    it('returns true when src directory exists', () => {
      mockExistsSync.mockReturnValue(true)

      expect(hasSrcDirectory()).toBe(true)
      expect(mockExistsSync).toHaveBeenCalledWith(expect.stringContaining('src'))
    })

    it('returns false when src directory does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      expect(hasSrcDirectory()).toBe(false)
    })
  })

  describe('generateSuggestedPath', () => {
    it('generates correct path for Next.js App Router with src', () => {
      expect(generateSuggestedPath('next-app', true)).toBe('./src/app')
    })

    it('generates correct path for Next.js App Router without src', () => {
      expect(generateSuggestedPath('next-app', false)).toBe('./app')
    })

    it('generates correct path for Next.js Pages Router with src', () => {
      expect(generateSuggestedPath('next-pages', true)).toBe('./src/styles')
    })

    it('generates correct path for Next.js Pages Router without src', () => {
      expect(generateSuggestedPath('next-pages', false)).toBe('./styles')
    })

    it('generates correct path for Remix', () => {
      expect(generateSuggestedPath('remix', true)).toBe('./app/styles')
      expect(generateSuggestedPath('remix', false)).toBe('./app/styles')
    })

    it('generates correct path for Vite with src', () => {
      expect(generateSuggestedPath('vite', true)).toBe('./src')
    })

    it('generates correct path for Vite without src', () => {
      expect(generateSuggestedPath('vite', false)).toBe('./public')
    })

    it('generates correct path for Create React App', () => {
      expect(generateSuggestedPath('create-react-app', true)).toBe('./src')
      expect(generateSuggestedPath('create-react-app', false)).toBe('./src')
    })

    it('generates correct path for other frameworks with src', () => {
      expect(generateSuggestedPath('other', true)).toBe('./src/styles')
    })

    it('generates correct path for other frameworks without src', () => {
      expect(generateSuggestedPath('other', false)).toBe('./styles')
    })
  })

  describe('getFrameworkInfo', () => {
    it('returns complete framework information', () => {
      mockExistsSync.mockImplementation((path) => {
        const pathStr = String(path)
        if (pathStr.includes('package.json')) return true
        if (pathStr.includes('src')) return true
        if (pathStr.includes('app')) return true
        return false
      })

      const packageJson = {
        dependencies: {
          next: '^14.0.0',
        },
      }
      mockReadFileSync.mockReturnValue(JSON.stringify(packageJson))

      const result = getFrameworkInfo()

      expect(result).toEqual({
        framework: 'next-app',
        hasSrcDir: true,
        suggestedPath: './src/app',
      })
    })
  })

  describe('getFrameworkDisplayName', () => {
    const testCases: Array<[Framework, string]> = [
      ['next-app', 'Next.js (App Router)'],
      ['next-pages', 'Next.js (Pages Router)'],
      ['remix', 'Remix'],
      ['vite', 'Vite'],
      ['create-react-app', 'Create React App'],
      ['other', 'Other/Generic'],
    ]

    testCases.forEach(([framework, expected]) => {
      it(`returns "${expected}" for "${framework}"`, () => {
        expect(getFrameworkDisplayName(framework)).toBe(expected)
      })
    })
  })
})
