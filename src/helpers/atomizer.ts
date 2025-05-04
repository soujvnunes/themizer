import PATH_UNIFIER from '../consts/pathUnifier'

import isAtom, { type Atom } from './isAtom'
import getVar from './getVar'

export type Vars = { [variable: string]: Atom }

export type FlattenVars = { [mediaQuery: string]: Atom | Vars }

export type ResponsiveVars = { [mediaQuery: string]: Vars }

export type Medias = { [media: string]: string }

export type R8eAtoms<M extends string> = [{ [Media in M]: Atom }, Atom?]

export interface Atoms<M extends string = never> {
  [key: string | number]: (Atom | Atoms<M>) | (M extends string ? R8eAtoms<M> : never)
}

export type ResolveAtoms<M extends Medias, A extends Atoms<Extract<keyof M, string>>> = {
  [Key in keyof A]: A[Key] extends [unknown, infer D]
    ? D
    : A[Key] extends [infer V]
    ? V extends Record<string, infer R>
      ? R
      : never
    : A[Key] extends Atoms<Extract<keyof M, string>>
    ? ResolveAtoms<M, A[Key]>
    : A[Key]
}

export type AtomizerOptions<M extends Medias> = {
  prefix?: string
  medias?: M
}

export interface Atomized<M extends Medias, A extends Atoms<Extract<keyof M, string>>> {
  vars: Vars & M extends string ? ResponsiveVars : never
  ref: ResolveAtoms<M, A>
}

export default function atomizer<
  const M extends Medias,
  const A extends Atoms<Extract<keyof M, string>>,
>(atoms: A, options?: AtomizerOptions<M>, __path?: string, __r8eAtoms?: ResponsiveVars) {
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
      const [medias, defaultValue] = atom as R8eAtoms<Extract<keyof M, string>>

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
