import type { FlattenVars, Vars } from './atomizer'
import isAtom from './isAtom'

export interface RJSS {
  [mediaQuery: string]: {
    ':root': Vars
  }
}

export default function getJSS(vars: FlattenVars) {
  const jss = {} as Record<string, FlattenVars>

  for (const [key, atom] of Object.entries(vars)) {
    if (isAtom(atom)) jss[':root'] = { ...jss[':root'], [key]: atom }
    else jss[key] = { ...jss[key], ':root': atom }
  }

  return jss as RJSS
}
