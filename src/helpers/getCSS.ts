import { type FlattenVars } from './atomizer'
import isAtom from './isAtom'

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
