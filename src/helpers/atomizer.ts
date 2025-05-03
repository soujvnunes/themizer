import isAtom, { type Atom } from './isAtom'
import PATH_UNIFIER from '../consts/pathUnifier'
import getVar from './getVar'

export interface Vars {
  [variable: string]: Atom
}

export type FlattenVars = Record<string, Atom | Vars>

export interface R8eVars {
  [mediaQuery: string]: Vars
}

export type R8eAtoms<M extends string> = [Record<M, Atom>, Atom?]

export interface Atoms<M extends string = never> {
  [key: string | number]: (Atom | Atoms<M>) | (M extends string ? R8eAtoms<M> : never)
}

export type ResolveAtoms<M extends string, A extends Atoms<M>> = {
  [Key in keyof A]: A[Key] extends [unknown, infer D]
    ? D
    : A[Key] extends [infer V]
    ? V extends Record<string, infer R>
      ? R
      : never
    : A[Key] extends Atoms<M>
    ? ResolveAtoms<M, A[Key]>
    : A[Key]
}

export type AtomizerOptions<M extends string = never> = {
  prefix?: string
  medias?: Record<M, string>
}

export interface Atomized<M extends string, A extends Atoms<M>> {
  vars: Vars & M extends string ? R8eVars : never
  ref: ResolveAtoms<M, A>
}

export default function atomizer<const M extends string, const A extends Atoms<M>>(
  atoms: A,
  options?: AtomizerOptions<M>,
  __path?: string,
  __r8eAtoms?: R8eVars,
) {
  const prefix = options?.prefix ? `${options.prefix}${PATH_UNIFIER}` : ''
  const unifiedPath = __path ? `${__path}${PATH_UNIFIER}` : ''

  const vars = {} as FlattenVars
  const ref = {} as Record<string, unknown>

  const r8eAtoms = __r8eAtoms ?? {}

  for (const [key, atom] of Object.entries(atoms)) {
    const path = `${prefix}${unifiedPath}${key}`
    const variable = `--${path}`

    if (isAtom(atom)) {
      vars[variable] = atom
      ref[key] = getVar(variable, atom)
    } else if (Array.isArray(atom)) {
      const [medias, defaultValue] = atom as R8eAtoms<M>

      for (const media in medias) {
        const mediaQuery = `@media ${options?.medias?.[media]}`

        r8eAtoms[mediaQuery] = { ...r8eAtoms[mediaQuery], [variable]: medias[media] }
      }

      if (isAtom(defaultValue)) vars[variable] = defaultValue

      ref[key] = getVar(variable, defaultValue)
    } else {
      const atomized = atomizer(atom, { ...options, prefix: '' }, path, r8eAtoms)

      Object.assign(vars, atomized.vars)
      ref[key] = atomized.ref
    }
  }

  Object.assign(vars, r8eAtoms)

  return {
    vars,
    ref,
  } as Atomized<M, A>
}
