import isAtom, { type Atom } from './isAtom'

export default function getVar(variable: string, defaultValue?: Atom): `var(${string})` {
  return `var(${variable}${isAtom(defaultValue) ? `, ${defaultValue}` : ''})`
}
