import { type Medias } from './atomizer'

/**
 * Adds the `@media` prefix to media query definitions.
 *
 * Transforms a map of media query names to their conditions by prepending
 * the `@media` at-rule prefix, making them ready for CSS output.
 *
 * @template M - Type extending Medias object
 * @param params - Object mapping media query names to their conditions
 * @returns Object with the same keys but values prefixed with '@media '
 *
 * @example
 * ```typescript
 * const mediaQueries = {
 *   dark: '(prefers-color-scheme: dark)',
 *   mobile: '(max-width: 768px)',
 *   print: 'print'
 * }
 *
 * const result = addAtMedia(mediaQueries)
 * // Returns:
 * // {
 * //   dark: '@media (prefers-color-scheme: dark)',
 * //   mobile: '@media (max-width: 768px)',
 * //   print: '@media print'
 * // }
 * ```
 *
 * @internal
 */
export default function addAtMedia<M extends Medias>(params: M) {
  const medias = {} as { [Media in keyof M]: `@media ${M[Media]}` }

  for (const media in params) {
    medias[media] = `@media ${params[media]}`
  }

  return medias
}
