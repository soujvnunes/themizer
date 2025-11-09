import addAtMedia from '../lib/addAtMedia'
import getCSS from '../lib/getCSS'
import getJSS from '../lib/getJSS'
import atomizer, {
  type ResolveAtoms,
  type AtomizerOptions,
  type Atoms,
  type Medias,
} from '../lib/atomizer'
import { validatePrefix, validateTokens } from '../lib/validators'

interface ThemizerOptions<M extends Medias, T extends Atoms> extends Required<AtomizerOptions<M>> {
  tokens: T
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
 *     tokens: { colors: { black: '#000' } }
 *   },
 *   ({ colors }) => ({
 *     palette: { text: colors.black }
 *   })
 * )
 * ```
 */
export default function themizer<
  const M extends Medias,
  const T extends Atoms,
  const A extends Atoms<Extract<keyof M, string>>,
>(options: ThemizerOptions<M, T>, aliases: (tokens: ResolveAtoms<never, T>) => A) {
  // Validate inputs
  validatePrefix(options.prefix)
  validateTokens(options.tokens as Record<string, unknown>)

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
  const flattenVariableMap = { ...tokenized.variableMap, ...aliased.variableMap }

  return {
    aliases: aliased.ref,
    tokens: tokenized.ref,
    medias: addAtMedia(options.medias),
    rules: {
      css: getCSS(flattenVars, flattenMetadata),
      jss: getJSS(flattenVars),
    },
    variableMap: Object.keys(flattenVariableMap).length > 0 ? flattenVariableMap : undefined,
  }
}
