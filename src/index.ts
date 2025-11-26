// Main functions
export { default } from './core/themizer'
export { default as unwrapAtom } from './core/unwrapAtom'
export { default as resolveAtom } from './core/resolveAtom'

// Core types

/**
 * Represents an atomic CSS value (string, number, or template literal).
 * Used as the base unit for all theme tokens.
 */
export type { Atom } from './lib/isAtom'

/**
 * Represents the JavaScript Style Sheet (JSS) object structure.
 * Contains CSS custom properties organized by media queries and root-level variables.
 * @internal For internal/advanced usage.
 */
export type { RJSS } from './lib/getJSS'

/**
 * Core atomizer types for building and configuring theme systems.
 *
 * - `Atoms`: Recursive structure of atomic values and nested objects
 * - `Medias`: Mapping of media query names to their conditions
 * - `ResolveAtoms`: Utility type for resolving atom references
 * - `AtomizerOptions`: Configuration options (prefix, media queries)
 * - `Vars`: Flat object mapping CSS variable names to values
 * - `ResponsiveVars`: CSS variables organized by media queries
 * - `Atomized`: Result type containing vars and type-safe references
 */
export type {
  Atoms,
  Medias,
  ResolveAtoms,
  AtomizerOptions,
  Vars,
  ResponsiveVars,
  Atomized,
} from './lib/atomizer'

// Validation utilities (for library users)
export { validatePrefix, validateTokens, isValidCSSIdentifier } from './lib/validators'
