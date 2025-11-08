import { type FlattenVars } from './atomizer'
import isAtom from './isAtom'

/**
 * Generates CSS string from flattened variables object.
 * Converts design tokens and media queries into valid CSS custom properties.
 *
 * @param vars - Flattened variables object with CSS custom properties and media queries
 * @returns CSS string with :root declarations and media queries
 *
 * @internal
 *
 * @example
 * ```ts
 * const css = getCSS({
 *   '--color': '#000',
 *   '@media (min-width: 768px)': {
 *     '--color': '#fff'
 *   }
 * })
 * // Returns: ':root{--color:#000;}@media (min-width: 768px){:root{--color:#fff;}}'
 * ```
 */
export default function getCSS(vars: FlattenVars) {
  let css = ':root{'
  let mediaCss = ''

  for (const [key, value] of Object.entries(vars)) {
    if (isAtom(value)) css += `${key}:${value};`
    else mediaCss += `${key}{${getCSS(value)}}`
  }

  css += '}'

  return css + mediaCss
}
