import type { ResolveSchema, Schema, ThemeOptions } from './types';
import generateVars from './generateVars';
import getJSS from './getJSS';
import getCSSFromJSS from './getCSSFromJSS';

export default function getTheme<
  M extends string,
  T extends Schema,
  A extends Schema<M>,
>(
  aliases: (tokens: ResolveSchema<never, T>) => A,
  options: ThemeOptions<M, T>,
) {
  const tokensVars = generateVars<never, T>(options.tokens, {
    prefixVars: `${options.prefixVars}-tokens`,
  });
  const aliasesVars = generateVars(aliases(tokensVars.reference), {
    ...options,
    prefixVars: `${options.prefixVars}-aliases`,
  });
  const jss = getJSS({
    ...tokensVars.value,
    ...aliasesVars.value,
  });
  const css = getCSSFromJSS(jss);

  return {
    aliases: aliasesVars.reference,
    tokens: tokensVars.reference,
    medias: options.medias,
    rules: { jss, css },
  };
}
