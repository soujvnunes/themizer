/**
 * Converts a counter index to a letter sequence (Excel column style)
 * 0 -> 'a', 1 -> 'b', ..., 25 -> 'z', 26 -> 'aa', 27 -> 'ab', etc.
 */
function indexToLetters(index: number): string {
  let result = ''
  let num = index

  while (num >= 0) {
    result = String.fromCharCode(97 + (num % 26)) + result
    num = Math.floor(num / 26) - 1
    if (num < 0) break
  }

  return result
}

/**
 * Generates a minified CSS variable name using the pattern:
 * a0, a1, ..., a9, b0, b1, ..., z9, aa0, aa1, ..., zz9, etc.
 *
 * @param counter - Sequential counter (0, 1, 2, ...)
 * @returns Minified variable name (e.g., "a0", "b5", "aa9")
 *
 * @example
 * minifyVariableName(0)   // "a0"
 * minifyVariableName(9)   // "a9"
 * minifyVariableName(10)  // "b0"
 * minifyVariableName(259) // "z9"
 * minifyVariableName(260) // "aa0"
 */
export function minifyVariableName(counter: number): string {
  const digit = counter % 10
  const letterIndex = Math.floor(counter / 10)
  const letters = indexToLetters(letterIndex)

  return `${letters}${digit}`
}
