import { Command } from 'commander'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import prompts from 'prompts'
import {
  getFrameworkInfo,
  getFrameworkDisplayName,
  type FrameworkDetectionResult,
} from './detectFramework'
import { validateFilePath, validatePlainObject } from './validators'
import { escapeSingleQuotes } from '../lib/shellEscape'
import { createError } from '../lib/createError'

interface InitOptions {
  watch?: boolean
  outDir?: string
}

const CONFIG_TEMPLATE = `import themizer from 'themizer'

/**
 * Example configuration for Themizer
 * Customize your design tokens below
 *
 * For complex Design Systems with multiple themes, you can export multiple themes:
 * export const brand1 = themizer({ prefix: 'brand1', ... }, () => ({}))
 * export const brand2 = themizer({ prefix: 'brand2', ... }, () => ({}))
 */

const alpha = (color: string, percentage: string) => \`color-mix(in srgb, \${color} \${percentage}, transparent)\`

export const theme = themizer(
  {
    prefix: 'theme',
    medias: {
      desktop: '(width >= 1024px)',
      dark: '(prefers-color-scheme: dark)',
      motion: '(prefers-reduced-motion: no-preference)',
    },
    tokens: {
      // Auto-expand properties
      palette: {
        /* palette.amber.lightest // oklch(98.92% 0.0102 81.8)
         * palette.amber.lighter  // oklch(96.2% 0.059 95.617)
         * palette.amber.light    // oklch(82.8% 0.189 84.429)
         * palette.amber.base     // oklch(76.9% 0.188 70.08)
         * palette.amber.dark     // oklch(66.6% 0.179 58.318)
         * palette.amber.darker   // oklch(35% 0.0771 45.635)
         * palette.amber.darkest  // oklch(14.92% 0.0268 85.77)
         */
        amber: 'oklch(76.9% 0.188 70.08)',
      },
      units: {
        /* Generates values from 0 to 4 in 0.25 steps:
         * units.rem[0]           // '0rem'
         * units.rem[0.25]        // '0.25rem'
         * units.rem[0.5]         // '0.5rem'
         * units.rem[0.75]        // '0.75rem'
         * ...up to units.rem[4] // '4rem'
         */
        rem: [0, 0.25, 4],
        /* Generates values from 0 to 64 in 4px steps:
         * units.px[0]           // '0px'
         * units.px[4]           // '4px'
         * units.px[8]           // '8px'
         * ...up to units.px[64] // '64px'
         */
        px: [0, 4, 64],
      },

      // Full control properties
      alphas: {
        100: '100%',
        80: '80%',
        60: '60%',
      },
      transitions: {
        bounce: '200ms cubic-bezier(0.5, -0.5, 0.25, 1.5)',
        ease: '200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  ({ palette, alphas, units, transitions }) => ({
    // Semantic aliases composed from tokens

    colors: {
      main: palette.amber.base,
      ground: {
        fore: [{ dark: palette.amber.lightest }, alpha(palette.amber.darkest, alphas[80])],
        back: [{ dark: palette.amber.darkest }, palette.amber.lightest],
      },
    },

    typography: {
      headline: [{ desktop: units.rem[4] }, units.rem[2.5]],
      title: [{ desktop: units.rem[2.5] }, units.rem[1.5]],
      subtitle: [{ desktop: units.rem[1.5] }, units.rem[1]],
      body: units.rem[1],
      caption: units.rem[0.75],
    },

    grid: {
      padding: [{ desktop: units.rem[2.5] }, units.rem[1.5]],
      margin: [{ desktop: units.rem[4] }, units.rem[2.5]],
    },

    animations: {
      bounce: [{ motion: transitions.bounce }],
      ease: [{ motion: transitions.ease }],
    },
  }),
)`

/**
 * Prompts the user interactively to select or customize the output directory
 */
async function promptForOutputDir(frameworkInfo: FrameworkDetectionResult): Promise<string | null> {
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
    return null
  }

  if (response.useDetected) {
    return frameworkInfo.suggestedPath
  }

  // Ensure customPath is a valid string, treat as cancellation otherwise
  return typeof response.customPath === 'string' ? response.customPath : null
}

/**
 * Updates package.json with the themizer script
 */
function updatePackageJson(packageJsonPath: string, outDir: string, watch: boolean): void {
  console.log('themizer: Updating package.json...')

  let packageJson
  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    validatePlainObject(packageJson)
  } catch (parseError) {
    if (parseError instanceof Error && parseError.message.includes('must be a plain object')) {
      createError('config', 'package.json must be a valid JSON object')
    } else {
      createError('config', `Invalid package.json: ${(parseError as Error).message}`)
    }
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
  const scriptName = watch ? 'themizer:theme:watch' : 'themizer:theme'
  const escapedOutDir = escapeSingleQuotes(outDir)
  const scriptCommand = watch
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

/**
 * Prints the next steps after successful initialization
 */
function printNextSteps(outDir: string, hasPackageJson: boolean, watch: boolean): void {
  console.log('')
  console.log('themizer: Initialization complete! 🎉')
  console.log('')
  console.log('Next steps:')
  console.log('  1. Customize your tokens in themizer.config.ts')
  console.log('  2. Generate theme.css:')
  console.log('')

  if (hasPackageJson) {
    const scriptName = watch ? 'themizer:theme:watch' : 'themizer:theme'
    console.log(`     npm run ${scriptName}`)
  } else {
    console.log(`     themizer theme --out-dir ${outDir}`)
  }

  console.log('')
  console.log(`  3. Import ${outDir}/theme.css in your application`)
  console.log('')
  console.log('For more information, visit: https://github.com/soujvnunes/themizer#readme')
}

export async function initAction(options: InitOptions): Promise<void> {
  const configPath = join(process.cwd(), 'themizer.config.ts')
  const packageJsonPath = join(process.cwd(), 'package.json')

  try {
    if (existsSync(configPath)) {
      console.error('themizer: themizer.config.ts already exists')
      console.log('themizer: If you want to recreate it, please delete the existing file first')
      process.exit(1)
    }

    const frameworkInfo = getFrameworkInfo()
    let outDir = options.outDir ?? frameworkInfo.suggestedPath

    if (options.outDir) {
      try {
        validateFilePath(outDir)
      } catch (error) {
        console.error(`themizer: Invalid output directory - ${(error as Error).message}`)
        process.exit(1)
      }
    } else {
      const selectedDir = await promptForOutputDir(frameworkInfo)
      if (selectedDir === null) {
        console.log('')
        console.log('themizer: Initialization cancelled')
        process.exit(0)
      }
      outDir = selectedDir
      console.log('')
    }

    console.log('themizer: Creating themizer.config.ts...')
    writeFileSync(configPath, CONFIG_TEMPLATE, 'utf-8')
    console.log('themizer: ✓ Created themizer.config.ts')

    const hasPackageJson = existsSync(packageJsonPath)
    if (hasPackageJson) {
      updatePackageJson(packageJsonPath, outDir, options.watch ?? false)
    }

    printNextSteps(outDir, hasPackageJson, options.watch ?? false)
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
