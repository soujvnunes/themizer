import PATH_UNIFIER from '../consts/PATH_UNIFIER'

import isAtom, { type Atom } from './isAtom'
import getVar from './getVar'
import { createPropertyMetadata, type PropertyMetadataMap } from './inferSyntax'
import { minifyVariableName } from './minifyVariableName'

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
  /** Mapping of minified variable names to original names */
  variableMap?: { [minified: string]: string }
}

/**
 * Internal state for recursive atomizer calls.
 * @internal
 */
interface AtomizerInternal {
  path?: string
  r8eAtoms?: ResponsiveVars
  metadata?: PropertyMetadataMap
  minify?: Map<string, string>
  minifyReverse?: Map<string, string>
}

/**
 * Gets or creates a minified variable name.
 * Returns the minified name as a string.
 */
function getMinifiedVariable(
  originalVariable: string,
  counter: number,
  forwardMap: Map<string, string>,
  reverseMap: Map<string, string>,
): string {
  // O(1) lookup using reverse map
  const existing = reverseMap.get(originalVariable)

  if (existing) {
    return existing
  }

  const minified = `--${minifyVariableName(counter)}`
  forwardMap.set(minified, originalVariable)
  reverseMap.set(originalVariable, minified)
  return minified
}

/**
 * Context for processing atoms, grouped to reduce parameter count.
 */
interface AtomContext<M extends Medias> {
  vars: FlattenVars
  r8eAtoms: ResponsiveVars
  metadata: PropertyMetadataMap
  options?: AtomizerOptions<M>
}

/**
 * Processes responsive atoms with media queries.
 */
function processResponsiveAtoms<M extends Medias>(
  atom: R8eAtoms<Extract<keyof M, string>>,
  variable: string,
  context: AtomContext<M>,
): string {
  const [medias, defaultValue] = atom

  for (const media in medias) {
    const mediaQuery = `@media ${context.options?.medias?.[media]}`
    context.r8eAtoms[mediaQuery] = { ...context.r8eAtoms[mediaQuery], [variable]: medias[media] }
  }

  if (isAtom(defaultValue)) {
    context.vars[variable] = defaultValue
    context.metadata[variable] = createPropertyMetadata(defaultValue)
  }

  return getVar(variable, defaultValue)
}

/**
 * Converts a nested structure of atomic values into CSS custom properties and references.
 *
 * The atomizer recursively processes an atoms object, generating:
 * - Minified CSS custom property definitions (e.g., --a0, --a1)
 * - Type-safe var() references to those properties
 * - Support for responsive values via media queries
 * - Variable map for debugging (mapping minified to original names)
 *
 * @template M - Medias configuration type (constrained to Medias)
 * @template A - Atoms structure type (constrained to Atoms)
 *
 * @param atoms - Nested structure of atomic values to convert
 * @param options - Optional configuration (prefix, media queries)
 * @param _internal - Internal state for recursion (do not use directly)
 *
 * @returns Object containing `vars` (minified CSS variables), `ref` (type-safe references), `metadata`, and `variableMap`
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
 * //   '--a0': '#000',
 * //   '--a1': '#666'
 * // }
 * // result.ref = {
 * //   color: {
 * //     primary: 'var(--a0, #000)',
 * //     secondary: 'var(--a1, #666)'
 * //   }
 * // }
 * // result.variableMap = {
 * //   '--a0': '--theme-color-primary',
 * //   '--a1': '--theme-color-secondary'
 * // }
 * ```
 *
 * @internal
 */
export default function atomizer<
  const M extends Medias,
  const A extends Atoms<Extract<keyof M, string>>,
>(atoms: A, options?: AtomizerOptions<M>, _internal?: AtomizerInternal) {
  const prefix = options?.prefix ? `${options.prefix}${PATH_UNIFIER}` : ''
  const unifiedPath = _internal?.path ? `${_internal.path}${PATH_UNIFIER}` : ''

  const minifyMap = _internal?.minify ?? new Map<string, string>()
  const minifyReverseMap = _internal?.minifyReverse ?? new Map<string, string>()

  const vars = {} as FlattenVars
  const ref = {} as Record<string, unknown>
  const metadata = _internal?.metadata ?? {}
  const r8eAtoms = _internal?.r8eAtoms ?? {}

  const context: AtomContext<M> = { vars, r8eAtoms, metadata, options }

  for (const [key, atom] of Object.entries(atoms)) {
    const path = `${prefix}${unifiedPath}${key}`
    const originalVariable = `--${path}`

    if (isAtom(atom)) {
      const variable = getMinifiedVariable(
        originalVariable,
        minifyMap.size,
        minifyMap,
        minifyReverseMap,
      )

      vars[variable] = atom
      ref[key] = getVar(variable, atom)
      metadata[variable] = createPropertyMetadata(atom)
    } else if (Array.isArray(atom)) {
      const variable = getMinifiedVariable(
        originalVariable,
        minifyMap.size,
        minifyMap,
        minifyReverseMap,
      )

      ref[key] = processResponsiveAtoms(atom as R8eAtoms<Extract<keyof M, string>>, variable, context)
    } else {
      const atomized = atomizer(
        atom,
        { ...options, prefix: '' },
        {
          path,
          r8eAtoms,
          metadata,
          minify: minifyMap,
          minifyReverse: minifyReverseMap,
        },
      )

      Object.assign(vars, atomized.vars)
      Object.assign(metadata, atomized.metadata)
      ref[key] = atomized.ref
    }
  }

  Object.assign(vars, r8eAtoms)

  const result: Atomized<M, A> = {
    vars,
    ref,
    metadata,
  } as Atomized<M, A>

  // Include variableMap at root level (when not recursing into nested objects)
  if (!_internal?.path && minifyMap.size > 0) {
    result.variableMap = Object.fromEntries(minifyMap)
  }

  return result
}
