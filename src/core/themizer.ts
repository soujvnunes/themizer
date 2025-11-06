import ThemeTempFile from '../helpers/ThemeTempFile'

import addAtMedia from '../lib/addAtMedia'
import getCSS from '../lib/getCSS'
import atomizer, {
  type ResolveAtoms,
  type AtomizerOptions,
  type Atoms,
  type Medias,
} from '../lib/atomizer'
import { validatePrefix, validateTokens } from '../lib/validators'

interface ThemizerOptions<M extends Medias, T extends Atoms> extends Required<AtomizerOptions<M>> {
  tokens: T
}

export default function themizer<
  const M extends Medias,
  const T extends Atoms,
  const A extends Atoms<Extract<keyof M, string>>,
>(options: ThemizerOptions<M, T>, aliases: (tokens: ResolveAtoms<never, T>) => A) {
  // Validate inputs
  validatePrefix(options.prefix)
  validateTokens(options.tokens as Record<string, unknown>)

  const tokenized = atomizer<never, T>(options.tokens, {
    prefix: `${options.prefix}-tokens`,
  })
  const aliased = atomizer(aliases(tokenized.ref), {
    ...options,
    prefix: `${options.prefix}-aliases`,
  })

  ThemeTempFile.write(getCSS({ ...tokenized.vars, ...aliased.vars }))

  return {
    aliases: aliased.ref,
    tokens: tokenized.ref,
    medias: addAtMedia(options.medias),
  }
}
