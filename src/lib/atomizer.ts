import PATH_UNIFIER from '../consts/PATH_UNIFIER'

import isAtom, { type Atom } from './isAtom'
import getVar from './getVar'
import { createPropertyMetadata, type PropertyMetadataMap } from './inferSyntax'

/**
 * Represents a flat object mapping CSS variable names to atomic values.
 */
export type Vars = { [variable: string]: Atom }

/**
 * Represents flattened CSS variables that can include media queries.
 * Keys can be variable names or media query strings (e.g., '@media (prefers-color-scheme: dark)').
 */
export type FlattenVars = { [mediaQuery: string]: Atom | Vars }

/**
 * Represents CSS variables organized by media queries.
 */
export type ResponsiveVars = { [mediaQuery: string]: Vars }

/**
 * Represents a mapping of media query names to their conditions.
 * @example { dark: '(prefers-color-scheme: dark)', mobile: '(max-width: 768px)' }
 */
export type Medias = { [media: string]: string }

/**
 * Represents responsive atoms: a tuple of media-specific values and an optional default.
 * @template M - Media query name type
 */
export type R8eAtoms<M extends string> = [{ [Media in M]: Atom }, Atom?]

/**
 * Represents a recursive structure of atomic values and nested atom objects.
 * @template M - Media query name type (defaults to never for non-responsive atoms)
 */
export interface Atoms<M extends string = never> {
  [key: string | number]: (Atom | Atoms<M>) | (M extends string ? R8eAtoms<M> : never)
}

/**
 * Resolves the atoms structure to return the resolved reference types.
 * Recursively processes nested atoms and responsive values to determine final types.
 *
 * @template M - Medias configuration type
 * @template A - Atoms structure type
 */
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

/**
 * Configuration options for the atomizer function.
 * @template M - Medias configuration type
 */
export type AtomizerOptions<M extends Medias> = {
  /** Optional prefix for generated CSS variable names */
  prefix?: string
  /** Optional media query definitions for responsive values */
  medias?: M
  /** Optional array of property paths to exclude from @property registration */
  overrides?: string[]
}

/**
 * Result of the atomizer function containing both variables and references.
 * @template M - Medias configuration type
 * @template A - Atoms structure type
 */
export interface Atomized<M extends Medias, A extends Atoms<Extract<keyof M, string>>> {
  /** Generated CSS variables (flat and responsive) */
  vars: Vars & M extends string ? ResponsiveVars : never
  /** Type-safe references to use in place of the original atoms */
  ref: ResolveAtoms<M, A>
  /** Property metadata for @property registration */
  metadata: PropertyMetadataMap
}

/**
 * Converts a nested structure of atomic values into CSS custom properties and references.
 *
 * The atomizer recursively processes an atoms object, generating:
 * - CSS custom property definitions (variables)
 * - Type-safe var() references to those properties
 * - Support for responsive values via media queries
 * - Hierarchical naming based on object nesting
 *
 * @template M - Medias configuration type (constrained to Medias)
 * @template A - Atoms structure type (constrained to Atoms)
 *
 * @param atoms - Nested structure of atomic values to convert
 * @param options - Optional configuration (prefix, media queries)
 * @param __path - Internal: Current path in the recursion (do not use)
 * @param __r8eAtoms - Internal: Accumulated responsive atoms (do not use)
 *
 * @returns Object containing `vars` (CSS variables) and `ref` (type-safe references)
 *
 * @example
 * ```typescript
 * const result = atomizer(
 *   {
 *     color: {
 *       primary: '#000',
 *       secondary: '#666'
 *     }
 *   },
 *   { prefix: 'theme' }
 * )
 * // result.vars = {
 * //   '--theme-color-primary': '#000',
 * //   '--theme-color-secondary': '#666'
 * // }
 * // result.ref = {
 * //   color: {
 * //     primary: 'var(--theme-color-primary, #000)',
 * //     secondary: 'var(--theme-color-secondary, #666)'
 * //   }
 * // }
 * ```
 *
 * @internal
 */
export default function atomizer<
  const M extends Medias,
  const A extends Atoms<Extract<keyof M, string>>,
>(
  atoms: A,
  options?: AtomizerOptions<M>,
  __path?: string,
  __r8eAtoms?: ResponsiveVars,
  __metadata?: PropertyMetadataMap,
) {
  const prefix = options?.prefix ? `${options.prefix}${PATH_UNIFIER}` : ''
  const unifiedPath = __path ? `${__path}${PATH_UNIFIER}` : ''

  const vars = {} as FlattenVars
  const ref = {} as Record<string, unknown>
  const metadata = __metadata ?? {}

  const r8eAtoms = __r8eAtoms ?? {}

  // Precompute a Set of normalized overrides for O(1) lookup
  const overridesSet = options?.overrides
    ? new Set(options.overrides.map((override) => override.split('.').join(PATH_UNIFIER)))
    : null

  // Helper to check if a property path should be excluded from registration
  const isOverridden = (propertyPath: string): boolean => {
    if (!overridesSet) return false
    const normalizedPath = propertyPath.startsWith(prefix)
      ? propertyPath.slice(prefix.length)
      : propertyPath
    return overridesSet.has(normalizedPath)
  }

  for (const [key, atom] of Object.entries(atoms)) {
    const path = `${prefix}${unifiedPath}${key}`
    const variable = `--${path}`

    if (isAtom(atom)) {
      vars[variable] = atom
      ref[key] = getVar(variable, atom)

      // Add metadata for @property registration if not overridden
      if (!isOverridden(path)) {
        metadata[variable] = createPropertyMetadata(atom)
      }
    } else if (Array.isArray(atom)) {
      const [medias, defaultValue] = atom as R8eAtoms<Extract<keyof M, string>>

      for (const media in medias) {
        const mediaQuery = `@media ${options?.medias?.[media]}`

        r8eAtoms[mediaQuery] = { ...r8eAtoms[mediaQuery], [variable]: medias[media] }
      }

      if (isAtom(defaultValue)) {
        vars[variable] = defaultValue

        // Add metadata for responsive properties using default value if not overridden
        if (!isOverridden(path)) {
          metadata[variable] = createPropertyMetadata(defaultValue)
        }
      }

      ref[key] = getVar(variable, defaultValue)
    } else {
      const atomized = atomizer(atom, { ...options, prefix: '' }, path, r8eAtoms, metadata)

      Object.assign(vars, atomized.vars)
      Object.assign(metadata, atomized.metadata)
      ref[key] = atomized.ref
    }
  }

  Object.assign(vars, r8eAtoms)

  return {
    vars,
    ref,
    metadata,
  } as Atomized<M, A>
}
