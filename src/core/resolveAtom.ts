import ATOM_REGEX from '../consts/ATOM_REGEX'

export default function resolveAtom(atom: string) {
  // Create a new regex instance to avoid global state issues with recursive calls
  const regex = new RegExp(ATOM_REGEX.source, ATOM_REGEX.flags)
  let match: RegExpMatchArray | null
  let extractedValue = ''

  while ((match = regex.exec(atom)) !== null) {
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
