import type { Atom } from './isAtom'
import { OKLAB_PATTERN } from './colorPatterns'

/**
 * Metadata for CSS @property registration
 */
export interface PropertyMetadata {
  syntax: string
  inherits: boolean
  initialValue: Atom
}

/**
 * Map of CSS custom property names to their metadata
 */
export type PropertyMetadataMap = Record<string, PropertyMetadata>

/**
 * CSS length units for @property syntax detection
 */
const LENGTH_UNITS = [
  'px',
  'em',
  'rem',
  'vh',
  'vw',
  'vmin',
  'vmax',
  'ch',
  'ex',
  'cm',
  'mm',
  'in',
  'pt',
  'pc',
  'q',
  'cap',
  'ic',
  'lh',
  'rlh',
  'vi',
  'vb',
  'svw',
  'svh',
  'lvw',
  'lvh',
  'dvw',
  'dvh',
]

/**
 * Pre-compiled RegExp for length value matching
 * Ensures at least one digit is present to avoid matching invalid values like ".px" or "-.rem"
 */
const LENGTH_PATTERN = new RegExp(`^-?(\\d+\\.?\\d*|\\d*\\.\\d+)\\s*(${LENGTH_UNITS.join('|')})$`, 'i')

/**
 * Set of CSS named colors (lowercase) for fast O(1) lookup
 */
const NAMED_COLORS_SET = new Set([
  // Special keywords
  'transparent',
  'currentcolor',
  // Basic colors (CSS Level 1 & 2)
  'black',
  'white',
  'red',
  'green',
  'blue',
  'yellow',
  'cyan',
  'magenta',
  'maroon',
  'purple',
  'fuchsia',
  'lime',
  'olive',
  'navy',
  'teal',
  'aqua',
  'silver',
  'gray',
  'grey',
  // Extended colors (CSS Level 3 & 4)
  'aliceblue',
  'antiquewhite',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'blanchedalmond',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgrey',
  'darkgreen',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'greenyellow',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgrey',
  'lightgreen',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'limegreen',
  'linen',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'oldlace',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'rebeccapurple',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'whitesmoke',
  'yellowgreen',
])

/**
 * Infers the CSS @property syntax type from a value
 * @param value - The CSS value to analyze
 * @returns The CSS syntax descriptor (e.g., "<color>", "<length>", "*")
 */
export function inferSyntax(value: Atom): string {
  const strValue = String(value).trim()

  // Empty or falsy values
  if (!strValue) return '*'

  // Color patterns
  if (isColor(strValue)) return '<color>'

  // Length patterns
  if (isLength(strValue)) return '<length>'

  // Percentage patterns
  if (isPercentage(strValue)) return '<percentage>'

  // Time patterns
  if (isTime(strValue)) return '<time>'

  // Angle patterns
  if (isAngle(strValue)) return '<angle>'

  // Integer patterns
  if (isInteger(strValue)) return '<integer>'

  // Number patterns (must come after integer check)
  if (isNumber(strValue)) return '<number>'

  // Complex expressions or unknown types use universal syntax
  return '*'
}

/**
 * Checks if a value is a CSS color
 */
export function isColor(value: string): boolean {
  // oklch(), oklab()
  if (OKLAB_PATTERN.test(value)) return true

  // lab(), lch()
  if (/^l(ab|ch)\s*\([^)]+\)/.test(value)) return true

  // rgb(), rgba()
  if (/^rgba?\s*\([^)]+\)/.test(value)) return true

  // hsl(), hsla()
  if (/^hsla?\s*\([^)]+\)/.test(value)) return true

  // hwb()
  if (/^hwb\s*\([^)]+\)/.test(value)) return true

  // color() - generic color function for different color spaces
  if (/^color\s*\([^)]+\)/.test(value)) return true

  // color-mix()
  if (/^color-mix\s*\([^)]+\)/.test(value)) return true

  // Hex colors (#RGB, #RGBA, #RRGGBB, #RRGGBBAA, etc.)
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)) return true

  // Named colors - O(1) lookup using Set
  if (NAMED_COLORS_SET.has(value.toLowerCase())) return true

  return false
}

/**
 * Checks if a value is a CSS length
 */
function isLength(value: string): boolean {
  return LENGTH_PATTERN.test(value)
}

/**
 * Checks if a value is a CSS percentage
 */
function isPercentage(value: string): boolean {
  return /^-?(\d+\.?\d*|\d*\.\d+)\s*%$/.test(value)
}

/**
 * Checks if a value is a CSS time value
 */
function isTime(value: string): boolean {
  return /^-?(\d+\.?\d*|\d*\.\d+)\s*(ms|s)$/i.test(value)
}

/**
 * Checks if a value is a CSS angle
 */
function isAngle(value: string): boolean {
  return /^-?(\d+\.?\d*|\d*\.\d+)\s*(deg|grad|rad|turn)$/i.test(value)
}

/**
 * Checks if a value is an integer
 */
function isInteger(value: string): boolean {
  return /^-?\d+$/.test(value)
}

/**
 * Checks if a value is a number (including decimals)
 */
function isNumber(value: string): boolean {
  return /^-?(\d+\.?\d*|\d*\.\d+)$/.test(value)
}

/**
 * Creates property metadata for a CSS custom property
 */
export function createPropertyMetadata(value: Atom): PropertyMetadata {
  return {
    syntax: inferSyntax(value),
    inherits: false,
    initialValue: value,
  }
}
