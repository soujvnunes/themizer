import atomizer, { type ResolveAtoms, type AtomizerOptions, type Atoms } from '../helpers/atomizer'
import getJSS from '../helpers/getJSS'
import getCSS from '../helpers/getCSS'
import addAtMedia from '../helpers/addAtMedia'

export interface ThemizerOptions<M extends string, T extends Atoms>
  extends Required<AtomizerOptions<M>> {
  tokens: T
}

export default function themizer<M extends string, T extends Atoms, A extends Atoms<M>>(
  aliases: (tokens: ResolveAtoms<never, T>) => A,
  options: ThemizerOptions<M, T>,
) {
  const tokenized = atomizer<never, T>(options.tokens, {
    prefix: `${options.prefix}-tokens`,
  })
  const aliased = atomizer(aliases(tokenized.ref), {
    ...options,
    prefix: `${options.prefix}-aliases`,
  })
  const flattenVars = {
    ...tokenized.vars,
    ...aliased.vars,
  }

  return {
    aliases: aliased.ref,
    tokens: tokenized.ref,
    medias: addAtMedia(options.medias),
    rules: {
      jss: getJSS(flattenVars),
      css: getCSS(flattenVars),
    },
  }
}
