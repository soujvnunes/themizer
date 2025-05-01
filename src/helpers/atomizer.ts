import isAtom, { type Atom } from './isAtom'
import getResponsiveAtom, { type ResponsiveAtom } from './getResponsiveAtom'
import isDefaultMedia, { type DefaultMedia } from './isDefaultMedia'
import PATH_UNIFIER from '../consts/pathUnifier'

export type AtomizerOptions<M extends string = never> = {
  prefix?: string
  medias?: Record<M, string>
}

export interface Vars {
  [customProperty: string]: Atom
}

export interface ResponsiveVars {
  [mediaQuery: string]: Vars
}

export interface Atoms<M extends string = never> {
  [key: string | number]: Atom | Atoms<M> | ResponsiveAtom<M>
}

export type ResolveAtoms<M extends string, A extends Atoms<M>> = {
  [Key in keyof A]: A[Key] extends ResponsiveAtom<M>
    ? DefaultMedia extends keyof A[Key]
      ? A[Key][DefaultMedia]
      : A[Key][M]
    : A[Key] extends Atoms<M>
    ? ResolveAtoms<M, A[Key]>
    : A[Key]
}

export interface Atomized<M extends string, A extends Atoms<M>> {
  vars: Vars & ResponsiveVars
  ref: ResolveAtoms<M, A>
}

export type FlattenVars = Record<string, Atom | Vars>

export default function atomizer<M extends string, A extends Atoms<M>>(
  atoms: A,
  options?: AtomizerOptions<M>,
  __path?: string,
  __responsiveAtoms?: ResponsiveVars,
) {
  const isResponsiveAtom = getResponsiveAtom(options?.medias)

  const prefix = options?.prefix ? `${options.prefix}${PATH_UNIFIER}` : ''
  const unifiedPath = __path ? `${__path}${PATH_UNIFIER}` : ''
  const responsiveAtoms = __responsiveAtoms ?? {}

  const vars = {} as FlattenVars
  const ref = {} as Record<string, unknown>

  for (const [key, atom] of Object.entries(atoms)) {
    const path = `${prefix}${unifiedPath}${key}`
    const variable = `--${path}`

    if (isAtom(atom)) {
      vars[variable] = atom
      ref[key] = `var(${variable}, ${atom})`
    } else if (isResponsiveAtom(atom)) {
      let defaultAtom = ''

      for (const [media, responsiveAtom] of Object.entries(atom)) {
        const mediaQuery = `@media ${options?.medias?.[media as M]}`

        if (isDefaultMedia(media)) {
          vars[variable] = responsiveAtom
          defaultAtom = `, ${responsiveAtom}`
        } else {
          responsiveAtoms[mediaQuery] = {
            ...responsiveAtoms[mediaQuery],
            [variable]: responsiveAtom,
          }
        }
      }

      ref[key] = `var(${variable}${defaultAtom})`
    } else {
      const atomized = atomizer(atom, { ...options, prefix: '' }, path, responsiveAtoms)

      Object.assign(vars, atomized.vars)
      ref[key] = atomized.ref
    }
  }

  Object.assign(vars, responsiveAtoms)

  return {
    vars,
    ref,
  } as Atomized<M, A>
}
