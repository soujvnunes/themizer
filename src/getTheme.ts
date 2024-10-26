import type {
  GeneratedVars,
  PurifySchema,
  Schema,
  ThemeOptions,
} from './types';
import generateVars from './generateVars';
import resolveThemePrefix from './resolveThemePrefix';
import dispatchVars from './dispatchVars';
import getRules from './getRules';

export default function getTheme<
  M extends string,
  T extends Schema,
  A extends Schema<M> = Schema<M>,
  R extends PurifySchema<M, T> = PurifySchema<M, T>,
  // TODO: create overloads to handle scenaries in which there's no tokens to be passed by aliases parameter
>(aliases: A | ((tokensReference: R) => A), options?: ThemeOptions<M, T>) {
  let currentRules = '';
  let tokensVars: GeneratedVars<M, T> | undefined;

  if (typeof options?.tokens !== 'undefined') {
    tokensVars = generateVars<M, T>(options.tokens, {
      prefixProperties: resolveThemePrefix('tokens', options?.prefixProperties),
    });
  }

  const resolvedAliases =
    typeof aliases === 'function'
      ? aliases(tokensVars?.reference as R)
      : aliases;
  const aliasesVars = generateVars<M, A>(resolvedAliases, {
    ...options,
    prefixProperties: resolveThemePrefix('aliases', options?.prefixProperties),
  });
  const rules = getRules({
    ...tokensVars?.value,
    ...aliasesVars.value,
  });

  if (rules !== currentRules) {
    currentRules = dispatchVars(rules);
  }

  return {
    aliases: aliasesVars.reference,
    tokens: tokensVars?.reference,
    medias: options?.medias,
  };
}
