/**
 * Converts a counter index to a letter sequence using bijective base-52
 * Uses both lowercase (a-z) and uppercase (A-Z) letters
 * 0 -> 'a', 25 -> 'z', 26 -> 'A', 51 -> 'Z', 52 -> 'aa', etc.
 */
function indexToLetters(index: number): string {
  const BASE = 52 // 26 lowercase + 26 uppercase
  let result = ''
  let num = index

  while (num >= 0) {
    const remainder = num % BASE
    // 0-25 = a-z (lowercase), 26-51 = A-Z (uppercase)
    const char =
      remainder < 26
        ? String.fromCharCode(97 + remainder) // lowercase a-z
        : String.fromCharCode(65 + (remainder - 26)) // uppercase A-Z
    result = char + result
    num = Math.floor(num / BASE) - 1
    if (num < 0) break
  }

  return result
}

/**
 * Generates a minified CSS variable name using the pattern:
 * a0...z9, A0...Z9, aa0...aZ9, ba0...bZ9, ..., ZZ9, aaa0, etc. (bijective base-52)
 *
 * When a prefix is provided, it replaces the initial letter, preventing collisions:
 * prefix0, prefix1, ..., prefix9, prefixa0, prefixa1, ..., prefixa9, prefixb0, ...
 *
 * @param counter - Sequential counter (0, 1, 2, ...)
 * @param prefix - Optional prefix that replaces the initial letter
 * @returns Minified variable name (e.g., "a0", "b5", "A0", "aa9", or "ui0" with prefix "ui")
 *
 * @example
 * minifyVariableName(0)         // "a0"
 * minifyVariableName(9)         // "a9"
 * minifyVariableName(10)        // "b0"
 * minifyVariableName(259)       // "z9"
 * minifyVariableName(260)       // "A0"
 * minifyVariableName(519)       // "Z9"
 * minifyVariableName(520)       // "aa0"
 * minifyVariableName(0, 'ui')   // "ui0"
 * minifyVariableName(9, 'ui')   // "ui9"
 * minifyVariableName(10, 'ui')  // "uia0"
 * minifyVariableName(260, 'ui') // "uiA0"
 * minifyVariableName(520, 'ds') // "dsaa0"
 */
export function minifyVariableName(counter: number, prefix?: string): string {
  const digit = counter % 10
  const letterIndex = Math.floor(counter / 10)

  if (prefix) {
    // With prefix: first 10 use just prefix+digit, then prefix+letters+digit
    if (letterIndex === 0) {
      return `${prefix}${digit}`
    }
    const letters = indexToLetters(letterIndex - 1)
    return `${prefix}${letters}${digit}`
  }

  // Without prefix: standard letter+digit pattern
  const letters = indexToLetters(letterIndex)
  return `${letters}${digit}`
}
