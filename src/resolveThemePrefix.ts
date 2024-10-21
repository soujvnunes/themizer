import type { GenerateVarsOptions } from './types';

export default function resolveThemePrefix<M extends string = never>(
  prefix: string,
  options?: GenerateVarsOptions<M>,
) {
  if (typeof options?.prefixProperties === 'undefined') return prefix;

  return `${options?.prefixProperties}-${prefix}`;
}
