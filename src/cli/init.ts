import { Command } from 'commander'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import prompts from 'prompts'
import { getFrameworkInfo, getFrameworkDisplayName } from './detectFramework'
import { validateFilePath, validatePlainObject } from './validators'
import { escapeSingleQuotes } from '../lib/shellEscape'

const CONFIG_TEMPLATE = `import themizer from 'themizer'

/**
 * Example configuration for Themizer
 * Customize your design tokens below
 */

const alpha = (color: string, percentage: string) => \`color-mix(in srgb, \${color} \${percentage}, transparent)\`

export default themizer(
  {
    prefix: 'theme',
    medias: {
      desktop: '(min-width: 1024px)',
      dark: '(prefers-color-scheme: dark)',
    },
    tokens: {
      colors: {
        amber: {
          50: "oklch(98% 0.02 85)",
          500: "oklch(76.9% 0.188 70.08)",
          900: "oklch(12% 0.03 70)",
          950: "oklch(6% 0.02 70)",
        },
      },
      alphas: {
        primary: "100%",
        secondary: "80%",
        tertiary: "60%",
        quaternary: "40%",
        quinary: "20%",
        senary: "10%",
        septenary: "6%",
        octonary: "4%",
        novenary: "2%",
        denary: "0%",
      },
      units: {
        0: '0',
        1: '0.0625rem',
        2: '0.125rem',
        4: '0.25rem',
        8: '0.5rem',
        12: '0.75rem',
        16: '1rem',
        24: '1.5rem',
        40: '2.5rem',
        64: '4rem',
        104: '6.5rem',
      },
    },
  },
  ({ colors, alphas, units }) => ({
    // Define your semantic aliases grouped by context

    palette: {
      foreground: [{ dark: colors.amber[50] }, alpha(colors.amber[950], alphas.secondary)],
      background: [{ dark: colors.amber[950] }, colors.amber[50]],
      main: colors.amber[500],
    },

    typography: {
      headline: [{ desktop: units[64] }, units[40]],
      title: [{ desktop: units[40] }, units[24]],
      subtitle: [{ desktop: units[24] }, units[16]],
      body: units[16],
      caption: units[12],
    },

    grid: {
      margin: [{ desktop: units[40] }, units[16]],
      gutter: [{ desktop: units[16] }, units[8]],
    },
  }),
)
`

export async function initAction(options: { watch?: boolean; outDir?: string }) {
  const configPath = join(process.cwd(), 'themizer.config.ts')
  const packageJsonPath = join(process.cwd(), 'package.json')

  try {
    // Check if config already exists
    if (existsSync(configPath)) {
      console.error('themizer: themizer.config.ts already exists')
      console.log('themizer: If you want to recreate it, please delete the existing file first')
      process.exit(1)
    }

    // Detect framework and suggest path
    const frameworkInfo = getFrameworkInfo()
    let outDir = options.outDir || frameworkInfo.suggestedPath

    // Validate outDir if provided via CLI flag (non-interactive mode)
    if (options.outDir) {
      try {
        validateFilePath(outDir)
      } catch (error) {
        console.error(`themizer: Invalid output directory - ${(error as Error).message}`)
        process.exit(1)
      }
    }

    // Interactive prompts if --out-dir is not provided
    if (!options.outDir) {
      console.log('')
      console.log('themizer: Setting up themizer in your project...')
      console.log('')

      const frameworkName = getFrameworkDisplayName(frameworkInfo.framework)
      console.log(`Detected framework: ${frameworkName}`)
      console.log(`Suggested output directory: ${frameworkInfo.suggestedPath}`)
      console.log('')

      const response = await prompts([
        {
          type: 'confirm',
          name: 'useDetected',
          message: `Use the suggested output directory (${frameworkInfo.suggestedPath})?`,
          initial: true,
        },
        {
          type: (prev) => (prev ? null : 'text'),
          name: 'customPath',
          message: 'Enter your custom output directory:',
          initial: frameworkInfo.suggestedPath,
          validate: (value) => {
            if (!value.trim()) {
              return 'Output directory is required'
            }
            try {
              validateFilePath(value)
              return true
            } catch (error) {
              return (error as Error).message
            }
          },
        },
      ])

      // Handle user cancellation (Ctrl+C)
      if (response.useDetected === undefined) {
        console.log('')
        console.log('themizer: Initialization cancelled')
        process.exit(0)
      }

      outDir = response.useDetected ? frameworkInfo.suggestedPath : response.customPath
      console.log('')
    }

    // Create themizer.config.ts
    console.log('themizer: Creating themizer.config.ts...')
    writeFileSync(configPath, CONFIG_TEMPLATE, 'utf-8')
    console.log('themizer: ✓ Created themizer.config.ts')

    // Update package.json if it exists
    if (existsSync(packageJsonPath)) {
      console.log('themizer: Updating package.json...')
      let packageJson
      try {
        packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        validatePlainObject(packageJson)
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message.includes('must be a plain object')) {
          throw new Error('package.json must be a valid JSON object')
        }
        throw new Error(`Invalid package.json: ${(parseError as Error).message}`)
      }

      // Initialize scripts object if it doesn't exist or is not an object
      if (
        !packageJson.scripts ||
        typeof packageJson.scripts !== 'object' ||
        Array.isArray(packageJson.scripts)
      ) {
        packageJson.scripts = {}
      }

      const scripts = packageJson.scripts as Record<string, unknown>

      // Add themizer script if it doesn't exist
      const scriptName = options.watch ? 'themizer:theme:watch' : 'themizer:theme'
      // Shell escaping IS necessary here because npm/pnpm/yarn execute scripts through a shell.
      // Without quotes, paths with spaces (e.g., "./my folder/styles") would be split into
      // multiple arguments by the shell. The quotes are stored literally in package.json and
      // correctly interpreted by the shell at execution time.
      const escapedOutDir = escapeSingleQuotes(outDir)
      const scriptCommand = options.watch
        ? `themizer theme --out-dir ${escapedOutDir} --watch`
        : `themizer theme --out-dir ${escapedOutDir}`

      if (!scripts[scriptName]) {
        scripts[scriptName] = scriptCommand
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8')
        console.log(`themizer: ✓ Added "${scriptName}" script to package.json`)
      } else {
        console.log(`themizer: Script "${scriptName}" already exists in package.json`)
      }
    }

    console.log('')
    console.log('themizer: Initialization complete! 🎉')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Customize your tokens in themizer.config.ts')
    console.log('  2. Generate theme.css:')
    console.log('')
    if (existsSync(packageJsonPath)) {
      const scriptName = options.watch ? 'themizer:theme:watch' : 'themizer:theme'
      console.log(`     npm run ${scriptName}`)
    } else {
      console.log(`     themizer theme --out-dir ${outDir}`)
    }
    console.log('')
    console.log(`  3. Import ${outDir}/theme.css in your application`)
    console.log('')
    console.log('For more information, visit: https://github.com/soujvnunes/themizer#readme')
  } catch (error) {
    console.error(`themizer: Failed to initialize - ${(error as Error).message}`)
    process.exit(1)
  }
}

const command = new Command('init')

command
  .description('Initialize themizer in your project')
  .option('--watch', 'Enable watch mode script for automatic CSS regeneration')
  .option('--out-dir <DIR>', 'Output directory for theme.css file (skips interactive prompts)')
  .addHelpText(
    'after',
    `
Description:
  Sets up themizer in your project by creating a starter configuration file
  and adding necessary scripts to your package.json.

  This command will:
    • Detect your framework (Next.js, Remix, Vite, etc.)
    • Suggest an appropriate output directory for theme.css
    • Create a themizer.config.ts file with example tokens
    • Add "themizer:theme" script to package.json with the correct path
    • Optionally configure watch mode for automatic regeneration

  If --out-dir is not provided, the command will run in interactive mode
  and prompt you to confirm or customize the suggested output directory.

Example:
  $ themizer init
  $ themizer init --watch
  $ themizer init --out-dir ./src/app
  $ themizer init --watch --out-dir ./app/styles

For more information, visit:
  https://github.com/soujvnunes/themizer#readme
`,
  )
  .action(initAction)

export default command
