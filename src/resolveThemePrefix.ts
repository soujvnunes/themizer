import type { GenerateVarsOptions } from './types';

export default function resolveThemePrefix<M extends string = never>(
  defaultPrefix: string,
  options?: GenerateVarsOptions<M>,
) {
  if (typeof options?.prefixProperties === 'undefined') return defaultPrefix;

  return `${options?.prefixProperties}-${defaultPrefix}`;
}
