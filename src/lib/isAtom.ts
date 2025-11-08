export type Atom = `${string}` | number

/**
 * Type guard that checks if a value is a valid Atom (primitive design token value).
 * An Atom is either a non-empty string or a number.
 *
 * @param params - Value to check
 * @returns True if the value is a valid Atom (string or number)
 *
 * @example
 * ```ts
 * isAtom('#000')      // Returns: true
 * isAtom(16)          // Returns: true
 * isAtom('')          // Returns: false
 * isAtom({})          // Returns: false
 * isAtom(null)        // Returns: false
 * ```
 */
export default function isAtom(params: unknown): params is Atom {
  return (typeof params === 'string' && !!params) || typeof params === 'number'
}
