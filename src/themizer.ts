import type { ResolveSchema, Schema, ThemizerOptions } from './types';
import atomizer from './atomizer';
import getJSS from './getJSS';
import getCSSFromJSS from './getCSSFromJSS';

export default function themizer<
  M extends string,
  T extends Schema,
  A extends Schema<M>,
>(
  aliasez: (tokens: ResolveSchema<never, T>) => A,
  options: ThemizerOptions<M, T>,
) {
  const tokens = atomizer<never, T>(options.tokens, {
    prefixAtoms: `${options.prefixAtoms}-tokens`,
  });
  const aliases = atomizer(aliasez(tokens.reference), {
    ...options,
    prefixAtoms: `${options.prefixAtoms}-aliases`,
  });
  const jss = getJSS({
    ...tokens.value,
    ...aliases.value,
  });
  const css = getCSSFromJSS(jss);

  return {
    aliases: aliases.reference,
    tokens: tokens.reference,
    medias: options.medias,
    rules: { jss, css },
  };
}
