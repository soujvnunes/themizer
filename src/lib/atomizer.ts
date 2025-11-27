import PATH_UNIFIER from '../consts/PATH_UNIFIER'

import isAtom, { type Atom } from './isAtom'
import getVar from './getVar'
import { createPropertyMetadata, type PropertyMetadataMap } from './inferSyntax'
import { minifyVariableName } from './minifyVariableName'
import { expandColor, type ColorShades } from './expandColor'
import { expandUnits } from './expandUnits'
import { shouldExpandColor } from './shouldExpandColor'
import { shouldExpandUnits } from './shouldExpandUnits'
import type { UnitsConfig, ExpandedUnits } from './unitTypes'

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
 *
 * Special behaviors for specific properties:
 * - `palette.*`: OKLCH strings auto-expand to 7 shades (lightest to darkest)
 * - `units`: UnitsConfig object with unit types as keys and [from, step, to] tuples as values
 *   Example: { rem: [0, 0.25, 4], px: [0, 4, 64] }
 */
export interface Atoms<M extends string = never> {
  [key: string | number]: (Atom | Atoms<M>) | (M extends string ? R8eAtoms<M> : never) | UnitsConfig
}

/**
 * Helper type for expanded palette structure.
 * Transforms OKLCH color strings to ColorShades objects within palette context.
 */
type ExpandedPalette<M extends Medias, P extends Atoms<Extract<keyof M, string>>> = {
  [Key in keyof P]: P[Key] extends string
    ? ColorShades
    : P[Key] extends Atoms<Extract<keyof M, string>>
    ? ResolveAtoms<M, P[Key]>
    : P[Key]
}

/**
 * Resolves the atoms structure to return the resolved reference types.
 * Recursively processes nested atoms and responsive values to determine final types.
 *
 * Special transformations:
 * - Color strings in 'palette' context → ColorShades
 * - Units config at 'units' key → ExpandedUnits
 *
 * @template M - Medias configuration type
 * @template A - Atoms structure type
 */
export type ResolveAtoms<M extends Medias, A extends Atoms<Extract<keyof M, string>>> = {
  [Key in keyof A]: Key extends 'palette'
    ? A[Key] extends Atoms<Extract<keyof M, string>>
      ? ExpandedPalette<M, A[Key]>
      : A[Key]
    : Key extends 'units'
    ? A[Key] extends UnitsConfig
      ? ExpandedUnits<A[Key]>
      : A[Key]
    : A[Key] extends [unknown, infer D]
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
  minifyPrefix?: string
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
  prefix?: string,
): string {
  // O(1) lookup using reverse map
  const existing = reverseMap.get(originalVariable)

  if (existing) {
    return existing
  }

  const minified = `--${minifyVariableName(counter, prefix)}`
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
    const propertyMeta = createPropertyMetadata(defaultValue)
    if (propertyMeta) {
      context.metadata[variable] = propertyMeta
    }
  }

  return getVar(variable, defaultValue)
}

/**
 * Processes a simple atom (string, number, etc.) and adds it to vars.
 */
function processSimpleAtom<M extends Medias>(
  atom: Atom,
  variable: string,
  context: AtomContext<M>,
): string {
  context.vars[variable] = atom
  const propertyMeta = createPropertyMetadata(atom)
  if (propertyMeta) {
    context.metadata[variable] = propertyMeta
  }
  return getVar(variable, atom)
}

/**
 * State needed for recursive atomizer calls.
 */
interface RecursiveState {
  path: string
  r8eAtoms: ResponsiveVars
  metadata: PropertyMetadataMap
  minifyMap: Map<string, string>
  minifyReverseMap: Map<string, string>
  minifyPrefix?: string
}

/**
 * Recursively processes expanded atoms (colors, units, or nested objects).
 */
function processNestedAtoms<M extends Medias>(
  expanded: Record<string, unknown>,
  options: AtomizerOptions<M> | undefined,
  state: RecursiveState,
): { vars: FlattenVars; ref: unknown; metadata: PropertyMetadataMap } {
  return atomizer(
    expanded as Atoms<Extract<keyof M, string>>,
    { ...options, prefix: '' },
    {
      path: state.path,
      r8eAtoms: state.r8eAtoms,
      metadata: state.metadata,
      minify: state.minifyMap,
      minifyReverse: state.minifyReverseMap,
      minifyPrefix: state.minifyPrefix,
    },
  )
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
  // Use minifyPrefix from _internal if available (for recursive calls),
  // otherwise strip -tokens or -aliases suffix from prefix
  const minifyPrefix = _internal?.minifyPrefix ?? options?.prefix?.replace(/-(tokens|aliases)$/, '')

  const vars = {} as FlattenVars
  const ref = {} as Record<string, unknown>
  const metadata = _internal?.metadata ?? {}
  const r8eAtoms = _internal?.r8eAtoms ?? {}

  const context: AtomContext<M> = { vars, r8eAtoms, metadata, options }

  for (const [key, atom] of Object.entries(atoms)) {
    const path = `${prefix}${unifiedPath}${key}`
    const originalVariable = `--${path}`

    const state: RecursiveState = {
      path,
      r8eAtoms,
      metadata,
      minifyMap,
      minifyReverseMap,
      minifyPrefix,
    }

    // Check for color expansion
    if (shouldExpandColor(atom, unifiedPath)) {
      const atomized = processNestedAtoms(expandColor(atom), options, state)
      Object.assign(vars, atomized.vars)
      Object.assign(metadata, atomized.metadata)
      ref[key] = atomized.ref
      continue
    }

    // Check for unit expansion
    if (shouldExpandUnits(atom, key)) {
      const atomized = processNestedAtoms(expandUnits(atom), options, state)
      Object.assign(vars, atomized.vars)
      Object.assign(metadata, atomized.metadata)
      ref[key] = atomized.ref
      continue
    }

    if (isAtom(atom)) {
      const variable = getMinifiedVariable(
        originalVariable,
        minifyMap.size,
        minifyMap,
        minifyReverseMap,
        minifyPrefix,
      )

      ref[key] = processSimpleAtom(atom, variable, context)
    } else if (Array.isArray(atom)) {
      const variable = getMinifiedVariable(
        originalVariable,
        minifyMap.size,
        minifyMap,
        minifyReverseMap,
        minifyPrefix,
      )

      ref[key] = processResponsiveAtoms(atom as R8eAtoms<Extract<keyof M, string>>, variable, context)
    } else {
      const atomized = processNestedAtoms(atom, options, state)
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
