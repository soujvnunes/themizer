import ATOM_REGEX from '../consts/ATOM_REGEX'

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
  // Reset lastIndex to ensure the regex starts from the beginning
  ATOM_REGEX.lastIndex = 0

  let match: RegExpMatchArray | null
  let extractedValue = ''

  while ((match = ATOM_REGEX.exec(atom)) !== null) {
    const defaultValue = match[2]

    if (defaultValue) {
      if (/^var\(--/.test(defaultValue)) {
        // Reset before recursive call
        ATOM_REGEX.lastIndex = 0
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
