import type { ResolveSchema, Schema, ThemeOptions } from './types';
import generateVars from './generateVars';
import getRules from './getRules';

export default function getTheme<M extends string, T extends Schema>(
  aliases: (tokens: ResolveSchema<never, T>) => Schema<M>,
  options: ThemeOptions<M, T>,
) {
  const tokensVars = generateVars(options.tokens, {
    prefixVars: `${options.prefixVars}-tokens`,
  });
  const aliasesVars = generateVars(aliases(tokensVars.reference), {
    ...options,
    prefixVars: `${options.prefixVars}-aliases`,
  });
  const rules = getRules({
    ...tokensVars.value,
    ...aliasesVars.value,
  });

  return {
    rules,
    aliases: aliasesVars.reference,
    tokens: tokensVars.reference,
    medias: options.medias,
  };
}
