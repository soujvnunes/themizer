import { Command } from 'commander'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import prompts from 'prompts'
import { getFrameworkInfo, getFrameworkDisplayName } from '../helpers/detectFramework'
import { validateFilePath } from '../lib/validators'

const CONFIG_TEMPLATE = `import themizer from 'themizer'

/**
 * Example configuration for Themizer
 * Customize your design tokens below
 */

// Define your media queries for responsive design
const medias = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  dark: '(prefers-color-scheme: dark)',
} as const

// Define your design tokens (raw values)
const tokens = {
  colors: {
    black: '#000000',
    white: '#ffffff',
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
}

// Initialize themizer with your configuration
const { aliases, tokens: resolvedTokens } = themizer(
  {
    prefix: 'theme',
    medias,
    tokens,
  },
  ({ colors, alphas, units }) => ({
    // Define your semantic aliases grouped by context

    palette: {
      text: [\`rgb(\${colors.black} / \${alphas.secondary})\`, { dark: \`rgb(\${colors.white} / \${alphas.primary})\` }],
      background: [colors.white, { dark: colors.black }],
      main: colors.green[500],
    },

    typography: {
      headline: [units[40], { lg: units[64] }],
      title: [units[24], { lg: units[40] }],
      subtitle: [units[16], { lg: units[24] }],
    },

    grid: {
      margin: [units[16], { lg: units[40] }],
      gutter: [units[8], { lg: units[16] }],
    },
  }),
)

export { aliases, resolvedTokens as tokens, medias }
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

        // Validate structure
        if (typeof packageJson !== 'object' || packageJson === null) {
          throw new Error('package.json must be a valid JSON object')
        }
      } catch (parseError) {
        throw new Error(`Invalid package.json: ${(parseError as Error).message}`)
      }

      // Initialize scripts object if it doesn't exist
      if (!packageJson.scripts) {
        packageJson.scripts = {}
      }

      // Add themizer script if it doesn't exist
      const scriptName = options.watch ? 'themizer:theme:watch' : 'themizer:theme'
      const scriptCommand = options.watch
        ? `themizer theme --out-dir ${outDir} --watch`
        : `themizer theme --out-dir ${outDir}`

      if (!packageJson.scripts[scriptName]) {
        packageJson.scripts[scriptName] = scriptCommand
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
