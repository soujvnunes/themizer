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
  // Use matchAll to avoid creating new regex instances and managing global state
  const matches = [...atom.matchAll(new RegExp(ATOM_REGEX.source, ATOM_REGEX.flags))]
  let extractedValue = ''

  for (const match of matches) {
    const defaultValue = match[2]

    if (defaultValue) {
      if (/^var\(--/.test(defaultValue)) return resolveAtom(defaultValue)

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
