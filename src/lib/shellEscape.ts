/**
 * Shell escaping utilities for safe command generation
 */

/**
 * Escapes a string for safe use in single-quoted shell commands.
 *
 * Single quotes in shell preserve everything literally except single quotes themselves.
 * To include a literal single quote, we use the pattern: '\'' which means:
 * - ' (end the current single-quoted string)
 * - \' (escaped single quote outside of quotes)
 * - ' (start a new single-quoted string)
 *
 * @param str - The string to escape
 * @returns The escaped string wrapped in single quotes
 *
 * @example
 * ```ts
 * escapeSingleQuotes("simple/path")
 * // Returns: 'simple/path'
 *
 * escapeSingleQuotes("path/with'quote")
 * // Returns: 'path/with'\''quote'
 *
 * escapeSingleQuotes("complex'path'with'quotes")
 * // Returns: 'complex'\''path'\''with'\''quotes'
 * ```
 */
export function escapeSingleQuotes(str: string): string {
  return `'${str.replace(/'/g, `'\\''`)}'`
}
