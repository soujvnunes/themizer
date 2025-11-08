// Main functions
export { default } from './core/themizer'
export { default as unwrapAtom } from './core/unwrapAtom'
export { default as resolveAtom } from './core/resolveAtom'

// Core types
export type { Atom } from './lib/isAtom'
export type {
  Atoms,
  Medias,
  ResolveAtoms,
  AtomizerOptions,
  Vars,
  ResponsiveVars,
  Atomized,
} from './lib/atomizer'

// Framework detection types (for CLI and advanced integrations)
export type { Framework, FrameworkDetectionResult } from './helpers/detectFramework'

// Validation utilities (for advanced users)
export {
  validatePrefix,
  validateTokens,
  validateFilePath,
  validateMediaQuery,
  isValidCSSIdentifier,
  isValidMediaQuery,
  sanitizeCSSValue,
} from './lib/validators'
