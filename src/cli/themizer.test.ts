const mockThemeAction = jest.fn().mockResolvedValue(undefined)
const mockInitAction = jest.fn().mockResolvedValue(undefined)

jest.mock('./theme', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Command } = require('commander')
  const command = new Command('theme')
  command
    .description('Generate theme.css file from your themizer configuration')
    .option('--out-dir <DIR>', 'Output directory for theme.css file (required)')
    .action(mockThemeAction)

  return {
    __esModule: true,
    themeAction: mockThemeAction,
    default: command,
  }
})

jest.mock('./init', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Command } = require('commander')
  const command = new Command('init')
  command
    .description('Initialize themizer in your project')
    .option('--watch', 'Enable watch mode script for automatic CSS regeneration')
    .action(mockInitAction)

  return {
    __esModule: true,
    initAction: mockInitAction,
    default: command,
  }
})

jest.mock('../helpers/writeThemeFile', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}))

describe('cli', () => {
  const processArgv = process.argv

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(process, 'exit').mockImplementation(jest.fn as never)
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    jest.spyOn(console, 'log').mockImplementation(jest.fn())
  })

  afterEach(() => {
    jest.restoreAllMocks()

    process.argv = processArgv
  })

  function renderArgv(...params: string[]) {
    process.argv = ['node', 'themizer', 'theme', ...params]
  }

  describe('running theme command', () => {
    it('calls the theme method', async () => {
      renderArgv('--out-dir=./')

      const cli = (await import('./themizer')).default
      await cli()

      expect(mockThemeAction).toHaveBeenCalledWith({ outDir: './' }, expect.any(Object))
    })
    describe('with missing options', () => {
      it('shows help screen', async () => {
        renderArgv()

        const cli = (await import('./themizer')).default
        await cli()

        expect(mockThemeAction).toHaveBeenCalled()
      })
    })
  })
})
