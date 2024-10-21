import type { GeneratedVars, Schema, ThemeOptions } from './types';
import generateVars from './generateVars';
import resolveThemePrefix from './resolveThemePrefix';

export default function getTheme<
  M extends string,
  T extends Schema,
  A extends Schema<M> = Schema<M>,
  // TODO: create overloads to handle scenaries in which there's no tokens to be passed by aliases parameter
>(aliases: A | ((tokens: T) => A), options?: ThemeOptions<M, T>) {
  const resolveAliases =
    typeof aliases === 'function' ? aliases(options?.tokens as T) : aliases;
  const aliasesVars = generateVars<M, A>(resolveAliases, {
    prefixProperties: resolveThemePrefix('aliases', options),
    medias: options?.medias,
  });
  let tokensVars: GeneratedVars<T, M> | undefined;

  if (typeof options?.tokens !== 'undefined') {
    tokensVars = generateVars<M, T>(options.tokens, {
      prefixProperties: resolveThemePrefix('tokens', options),
    });
  }

  // TODO: inject aliasesVars.value tokensVars?.value in a css file w

  return {
    aliases: aliasesVars.reference,
    tokens: tokensVars?.reference,
    medias: options?.medias,
  };
}
