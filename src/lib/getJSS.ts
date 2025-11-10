import type { FlattenVars, Vars } from './atomizer'
import type { PropertyMetadataMap } from './inferSyntax'
import isAtom from './isAtom'

/**
 * Represents a CSS @property registration rule in JSS format.
 */
export type PropertyRule = {
  syntax: string
  inherits: boolean
  initialValue: string
}

/**
 * Represents the JavaScript Style Sheet (JSS) object structure for theme rules.
 *
 * This type describes the structure of the JSS representation of CSS custom properties,
 * organized by media queries and root-level variables.
 *
 * @remarks
 * The RJSS type uses an intersection to allow:
 * - Optional '@property' rules for CSS custom property registration
 * - An optional ':root' property containing root-level CSS variables
 * - Dynamic media query keys (e.g., '@media (prefers-color-scheme: dark)')
 *   that contain nested ':root' objects with variable definitions
 *
 * @internal
 */
export type RJSS = {
  ':root'?: Vars
} & {
  [key: `@property ${string}` | `@media ${string}`]:
    | PropertyRule
    | {
        ':root': Vars
      }
}

/**
 * Converts flattened CSS variables into a JavaScript Style Sheet (JSS) object structure.
 *
 * Organizes CSS custom properties by media queries and root-level variables,
 * creating a structured representation suitable for generating CSS output.
 *
 * @param vars - Flattened CSS variables, where keys can be plain variable names
 *               or media query prefixes
 * @param metadata - Optional map of property metadata for @property registration
 * @returns A structured JSS object with variables organized by media queries
 *
 * @example
 * ```typescript
 * const flatVars = {
 *   '--color-primary': '#000',
 *   '@media (prefers-color-scheme: dark)': {
 *     '--color-primary': '#fff'
 *   }
 * }
 * const metadata = {
 *   '--color-primary': {
 *     syntax: '<color>',
 *     inherits: false,
 *     initialValue: '#000'
 *   }
 * }
 * const jss = getJSS(flatVars, metadata)
 * // Returns:
 * // {
 * //   '@property --color-primary': {
 * //     syntax: '"<color>"',
 * //     inherits: false,
 * //     initialValue: '#000'
 * //   },
 * //   ':root': { '--color-primary': '#000' },
 * //   '@media (prefers-color-scheme: dark)': {
 * //     ':root': { '--color-primary': '#fff' }
 * //   }
 * // }
 * ```
 *
 * @internal
 */
export default function getJSS(vars: FlattenVars, metadata?: PropertyMetadataMap) {
  const jss: Record<string, unknown> = {}

  // Add @property registration rules
  if (metadata) {
    for (const [name, meta] of Object.entries(metadata)) {
      jss[`@property ${name}`] = {
        syntax: `"${meta.syntax}"`,
        inherits: meta.inherits,
        initialValue: String(meta.initialValue),
      }
    }
  }

  // Add custom property declarations
  for (const [key, atom] of Object.entries(vars)) {
    if (isAtom(atom)) jss[':root'] = { ...((jss[':root'] as Vars) || {}), [key]: atom }
    else jss[key] = { ...((jss[key] as { ':root': Vars }) || {}), ':root': atom }
  }

  return jss as RJSS
}
