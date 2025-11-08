import { type FlattenVars } from './atomizer'
import type { PropertyMetadataMap } from './inferSyntax'
import isAtom from './isAtom'

/**
 * Generates @property CSS rules from metadata
 * @param metadata - Map of property names to their metadata
 * @returns CSS string with @property declarations
 */
function generatePropertyRules(metadata: PropertyMetadataMap): string {
  let propertyRules = ''

  for (const [name, meta] of Object.entries(metadata)) {
    propertyRules += `@property ${name}{syntax:"${meta.syntax}";inherits:${meta.inherits};initial-value:${meta.initialValue};}`
  }

  return propertyRules
}

/**
 * Generates CSS string from flattened variables object.
 * Converts design tokens and media queries into valid CSS custom properties.
 *
 * @param vars - Flattened variables object with CSS custom properties and media queries
 * @param metadata - Optional metadata for @property registration
 * @returns CSS string with @property declarations, :root declarations and media queries
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
export default function getCSS(vars: FlattenVars, metadata?: PropertyMetadataMap) {
  let propertyRules = ''
  let css = ':root{'
  let mediaCss = ''

  // Generate @property rules if metadata is provided (only on initial call)
  if (metadata) {
    propertyRules = generatePropertyRules(metadata)
  }

  for (const [key, value] of Object.entries(vars)) {
    if (isAtom(value)) css += `${key}:${value};`
    else mediaCss += `${key}{${getCSS(value)}}`
  }

  css += '}'

  return propertyRules + css + mediaCss
}
