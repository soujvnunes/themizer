import ATOM_REGEX from '../consts/ATOM_REGEX'

// Extract regex source once at module level to avoid repeated property access
const ATOM_REGEX_SOURCE = ATOM_REGEX.source

/**
 * Resolves a CSS custom property var() expression to its default value.
 * Recursively unwraps nested var() expressions until a primitive value is found.
 *
 * @param atom - A CSS var() expression with a default value (e.g., 'var(--theme-color, #000)')
 * @returns The resolved default value (string or number)
 * @throws {Error} If the atom doesn't have a default value
 *
 * @example
 * ```ts
 * resolveAtom('var(--theme-color, #000)')     // Returns: '#000'
 * resolveAtom('var(--spacing, 16)')           // Returns: 16 (number)
 * resolveAtom('var(--nested, var(--base, 8))') // Returns: 8 (recursively resolved)
 * ```
 */
export default function resolveAtom(atom: string) {
  // Create a fresh regex instance to avoid global state issues with recursive calls.
  // We cache the regex source at module level, but still create a new RegExp object
  // on each call to ensure the 'g' flag's lastIndex is reset for each invocation.
  // This is necessary because recursive calls would otherwise interfere with each other's
  // regex state if we shared a single global RegExp instance.
  const regex = new RegExp(ATOM_REGEX_SOURCE, 'g')
  let match: RegExpMatchArray | null
  let extractedValue = ''

  while ((match = regex.exec(atom)) !== null) {
    const defaultValue = match[2]

    if (defaultValue) {
      if (/^var\(--/.test(defaultValue)) {
        return resolveAtom(defaultValue)
      }

      extractedValue = defaultValue.trim()
    }
  }

  if (!extractedValue) {
    throw new Error(
      `themizer/resolveAtom: Expected wrapped custom property '${atom}' to have a default value.`,
    )
  }

  const formattedValue = Number(extractedValue)

  return Number.isNaN(formattedValue) ? extractedValue : formattedValue
}
