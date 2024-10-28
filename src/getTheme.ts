import type { GeneratedVars, Schema, ThemeOptions } from './types';
import generateVars from './generateVars';
import resolveThemePrefix from './resolveThemePrefix';
import getRules from './getRules';

export default function getTheme<
  M extends string,
  T extends Schema,
  A extends Schema<M>,
  // TODO: create overloads to handle scenaries in which there's no tokens to be passed by aliases parameter
>(aliases: A | ((tokens: T) => A), options?: ThemeOptions<M, T>) {
  let tokensVars: GeneratedVars<never, T> | undefined;

  if (typeof options?.tokens !== 'undefined') {
    tokensVars = generateVars(options.tokens, {
      prefixProperties: resolveThemePrefix('tokens', options?.prefixProperties),
    });
  }

  const resolvedAliases =
    typeof aliases === 'function'
      ? aliases(tokensVars?.reference as T)
      : aliases;
  const aliasesVars = generateVars<M, A>(resolvedAliases, {
    ...options,
    prefixProperties: resolveThemePrefix('aliases', options?.prefixProperties),
  });
  const rules = getRules({
    ...tokensVars?.value,
    ...aliasesVars.value,
  });

  return {
    // TODO: use wyw-in-js to process those rules into a css file
    rules,
    aliases: aliasesVars.reference,
    tokens: tokensVars?.reference,
    medias: options?.medias,
  };
}
