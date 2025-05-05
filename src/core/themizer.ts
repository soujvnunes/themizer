import addAtMedia from '../helpers/addAtMedia'
import getCSS from '../helpers/getCSS'
import atomizer, {
  type ResolveAtoms,
  type AtomizerOptions,
  type Atoms,
  type Medias,
} from '../helpers/atomizer'
import writeThemeFile, { type WriteThemeFileParams } from '../helpers/writeThemeFile'

interface ThemizerOptions<M extends Medias, T extends Atoms> extends Required<AtomizerOptions<M>> {
  tokens: T
  outDir?: WriteThemeFileParams['outDir']
}

export default function themizer<
  const M extends Medias,
  const T extends Atoms,
  const A extends Atoms<Extract<keyof M, string>>,
>({ outDir, ...options }: ThemizerOptions<M, T>, aliases: (tokens: ResolveAtoms<never, T>) => A) {
  const tokenized = atomizer<never, T>(options.tokens, {
    prefix: `${options.prefix}-tokens`,
  })
  const aliased = atomizer(aliases(tokenized.ref), {
    ...options,
    prefix: `${options.prefix}-aliases`,
  })

  writeThemeFile({
    outDir,
    atoms: getCSS({ ...tokenized.vars, ...aliased.vars }),
  })

  return {
    aliases: aliased.ref,
    tokens: tokenized.ref,
    medias: addAtMedia(options.medias),
  }
}
