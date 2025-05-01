import ATOM_REGEX from '../consts/atomRegex'

export default function resolveAtom(atom: string) {
  let match: RegExpMatchArray | null
  let extractedValue = ''

  while ((match = ATOM_REGEX.exec(atom)) !== null) {
    const defaultValue = match[2]

    if (defaultValue) {
      console.log(defaultValue)

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
