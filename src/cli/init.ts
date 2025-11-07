import { Command } from 'commander'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import prompts from 'prompts'
import { getFrameworkInfo, getFrameworkDisplayName } from '../helpers/detectFramework'
import { validateFilePath, validatePlainObject } from '../lib/validators'
import { escapeSingleQuotes } from '../lib/shellEscape'

const CONFIG_TEMPLATE = `import themizer from 'themizer'

/**
 * Example configuration for Themizer
 * Customize your design tokens below
 */

export const { aliases, tokens, medias } = themizer(
  {
    prefix: 'theme',
    medias: {
      desktop: '(min-width: 1024px)',
      dark: '(prefers-color-scheme: dark)',
    },
    tokens: {
      colors: {
        black: '#000000',
        white: '#ffffff',
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        yellow: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      alphas: {
        primary: 1,
        secondary: 0.8,
        tertiary: 0.6,
        quaternary: 0.4,
        quinary: 0.2,
        senary: 0.1,
        septenary: 0.06,
        octonary: 0.04,
        novenary: 0.02,
        denary: 0,
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
      text: [{ dark: \`rgb(\${colors.white} / \${alphas.primary})\` }, \`rgb(\${colors.black} / \${alphas.secondary})\`],
      background: [{ dark: colors.black }, colors.white],
      main: colors.green[500],
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
    console.log('  2. Import and use themizer in your application:')
    console.log('')
    console.log("     import './themizer.config'")
    console.log('')
    console.log('  3. Generate theme.css:')
    console.log('')
    if (existsSync(packageJsonPath)) {
      const scriptName = options.watch ? 'themizer:theme:watch' : 'themizer:theme'
      console.log(`     npm run ${scriptName}`)
    } else {
      console.log(`     themizer theme --out-dir ${outDir}`)
    }
    console.log('')
    console.log(`  4. Import ${outDir}/theme.css in your application`)
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
