import type { FlattenVars, Vars } from './atomizer'
import isAtom from './isAtom'

/**
 * Represents the JavaScript Style Sheet (JSS) object structure for theme rules.
 *
 * This type describes the structure of the JSS representation of CSS custom properties,
 * organized by media queries and root-level variables.
 *
 * @remarks
 * The RJSS type uses an intersection to allow both:
 * - An optional ':root' property containing root-level CSS variables
 * - Dynamic media query keys (e.g., '@media (prefers-color-scheme: dark)')
 *   that can contain either nested ':root' objects or direct variable definitions
 *
 * @internal
 */
export type RJSS = {
  ':root'?: Vars
} & {
  [mediaQuery: string]:
    | {
        ':root': Vars
      }
    | Vars
}

/**
 * Converts flattened CSS variables into a JavaScript Style Sheet (JSS) object structure.
 *
 * Organizes CSS custom properties by media queries and root-level variables,
 * creating a structured representation suitable for generating CSS output.
 *
 * @param vars - Flattened CSS variables, where keys can be plain variable names
 *               or media query prefixes
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
 * const jss = getJSS(flatVars)
 * // Returns:
 * // {
 * //   ':root': { '--color-primary': '#000' },
 * //   '@media (prefers-color-scheme: dark)': {
 * //     ':root': { '--color-primary': '#fff' }
 * //   }
 * // }
 * ```
 *
 * @internal
 */
export default function getJSS(vars: FlattenVars) {
  const jss = {} as Record<string, FlattenVars>

  for (const [key, atom] of Object.entries(vars)) {
    if (isAtom(atom)) jss[':root'] = { ...jss[':root'], [key]: atom }
    else jss[key] = { ...jss[key], ':root': atom }
  }

  return jss as RJSS
}
