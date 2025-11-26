import addAtMedia from '../lib/addAtMedia'
import getCSS from '../lib/getCSS'
import getJSS from '../lib/getJSS'
import atomizer, {
  type ResolveAtoms,
  type AtomizerOptions,
  type Atoms,
  type Medias,
} from '../lib/atomizer'
import {
  validatePrefix,
  validateTokens,
  validateUnitsConfig,
  validatePaletteConfig,
} from '../lib/validators'
import INTERNAL from '../consts/INTERNAL'
import OKLCH_PATTERN from '../consts/OKLCH_PATTERN'

interface ThemizerOptions<M extends Medias, T extends Atoms> extends Required<AtomizerOptions<M>> {
  tokens: T
}

interface ValidationState {
  hasErrors: boolean
}

const isDev = process.env.NODE_ENV === 'development'
const FALLBACK_PREFIX = 'theme'
const FALLBACK_COLOR = 'oklch(50% 0 0)'

/**
 * Handles validation with dev/prod mode behavior.
 * In dev mode, logs error and continues. In prod mode, throws.
 */
function handleValidation(validateFn: () => void, state: ValidationState): void {
  try {
    validateFn()
  } catch (error) {
    if (isDev) {
      console.error(error instanceof Error ? error.message : error)
      state.hasErrors = true
    } else {
      throw error
    }
  }
}

/**
 * Replaces invalid palette entries with fallback color.
 */
function fixInvalidPaletteEntries(palette: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(palette)) {
    if (typeof value !== 'string' || !OKLCH_PATTERN.test(value)) {
      palette[key] = FALLBACK_COLOR
    }
  }
}

/**
 * Main themizer function that generates CSS custom properties from design tokens and aliases.
 *
 * @param options - Configuration object with prefix, media queries, and design tokens
 * @param options.prefix - Prefix for CSS custom properties (e.g., 'theme' generates --theme-*)
 * @param options.medias - Media query definitions for responsive design
 * @param options.tokens - Design tokens (colors, spacing, etc.)
 * @param aliases - Function that receives resolved tokens and returns semantic aliases
 * @returns Object containing resolved aliases, tokens, and media query helpers
 *
 * @example
 * ```ts
 * const { aliases, tokens, medias } = themizer(
 *   {
 *     prefix: 'theme',
 *     medias: { md: '(min-width: 768px)' },
 *     tokens: {
 *       palette: { amber: 'oklch(76.9% 0.188 70.08)' },
 *       colors: { black: '#000' }
 *     }
 *   },
 *   ({ palette, colors }) => ({
 *     text: { primary: colors.black, accent: palette.amber.base }
 *   })
 * )
 * ```
 */
export default function themizer<
  const M extends Medias,
  const T extends Atoms,
  const A extends Atoms<Extract<keyof M, string>>,
>(options: ThemizerOptions<M, T>, aliases: (tokens: ResolveAtoms<never, T>) => A) {
  const state: ValidationState = { hasErrors: false }

  // Validate prefix with fallback
  handleValidation(() => validatePrefix(options.prefix), state)
  if (state.hasErrors && isDev) {
    ;(options as { prefix: string }).prefix = FALLBACK_PREFIX
  }

  // Validate tokens structure
  handleValidation(() => validateTokens(options.tokens as Record<string, unknown>), state)

  // Validate units config
  if ('units' in options.tokens) {
    handleValidation(() => validateUnitsConfig(options.tokens.units, 'tokens.units'), state)
  }

  // Validate palette config with fallback colors
  if ('palette' in options.tokens) {
    const prevHasErrors = state.hasErrors
    handleValidation(() => validatePaletteConfig(options.tokens.palette, 'tokens.palette'), state)
    if (state.hasErrors && !prevHasErrors && isDev) {
      fixInvalidPaletteEntries(options.tokens.palette as Record<string, unknown>)
    }
  }

  // Log build status in dev mode
  if (isDev) {
    console.log(
      state.hasErrors
        ? 'themizer: Theme built with errors (see above)'
        : 'themizer: Theme built successfully',
    )
  }

  const tokenized = atomizer<never, T>(options.tokens, {
    prefix: `${options.prefix}-tokens`,
  })

  // Pass the minification map from tokens to aliases to avoid variable name collisions
  const minifyMap = new Map<string, string>()
  const minifyReverseMap = new Map<string, string>()
  if (tokenized.variableMap) {
    Object.entries(tokenized.variableMap).forEach(([minified, original]) => {
      minifyMap.set(minified, original)
      minifyReverseMap.set(original, minified)
    })
  }

  const aliased = atomizer(
    aliases(tokenized.ref),
    {
      prefix: `${options.prefix}-aliases`,
      medias: options.medias,
    },
    {
      minify: minifyMap,
      minifyReverse: minifyReverseMap,
    },
  )

  const flattenVars = { ...tokenized.vars, ...aliased.vars }
  const flattenMetadata = { ...tokenized.metadata, ...aliased.metadata }
  const flattenVariableMap = { ...(tokenized.variableMap ?? {}), ...(aliased.variableMap ?? {}) }

  return {
    aliases: aliased.ref,
    tokens: tokenized.ref,
    medias: addAtMedia(options.medias),

    /** @internal CLI access only */
    [INTERNAL]: {
      rules: {
        css: getCSS(flattenVars, flattenMetadata),
        jss: getJSS(flattenVars, flattenMetadata),
      },
      variableMap: Object.keys(flattenVariableMap).length > 0 ? flattenVariableMap : undefined,
    },
  }
}
