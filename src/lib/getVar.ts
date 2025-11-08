import isAtom, { type Atom } from './isAtom'

/**
 * Creates a CSS `var()` function expression with an optional fallback value.
 *
 * Generates a properly formatted CSS variable reference that can be used
 * in stylesheets. Supports optional default/fallback values.
 *
 * @param variable - The CSS variable name (e.g., '--color-primary')
 * @param defaultValue - Optional fallback value to use if the variable is not defined
 * @returns A CSS var() expression as a template literal string
 *
 * @example
 * ```typescript
 * // Simple variable reference
 * getVar('--color-primary')
 * // Returns: 'var(--color-primary)'
 *
 * // With fallback value
 * getVar('--color-primary', '#000')
 * // Returns: 'var(--color-primary, #000)'
 *
 * // Nested var() with fallback
 * getVar('--spacing-md', getVar('--spacing-base'))
 * // Returns: 'var(--spacing-md, var(--spacing-base))'
 * ```
 *
 * @internal
 */
export default function getVar(variable: string, defaultValue?: Atom): `var(${string})` {
  return `var(${variable}${isAtom(defaultValue) ? `, ${defaultValue}` : ''})`
}
