/**
 * Extracts the CSS custom property name from a var() expression.
 *
 * @param wrappedVariable - A CSS var() expression (e.g., 'var(--theme-color)')
 * @returns The custom property name without var() wrapper (e.g., '--theme-color'), or undefined if not found
 *
 * @example
 * ```ts
 * unwrapAtom('var(--theme-color)') // Returns: '--theme-color'
 * unwrapAtom('--theme-color')      // Returns: '--theme-color'
 * unwrapAtom('invalid')            // Returns: undefined
 * ```
 */
export default function unwrapAtom(wrappedVariable: string) {
  return wrappedVariable.match(/--[\w+\-{1}]+/g)?.[0]
}
