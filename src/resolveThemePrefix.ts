import type { GenerateVarsOptions } from './types';

export default function resolveThemePrefix<M extends string = never>(
  defaultPrefix: string,
  prefixProperties?: GenerateVarsOptions<M>['prefixProperties'],
) {
  if (typeof prefixProperties === 'undefined') return defaultPrefix;

  return `${prefixProperties}-${defaultPrefix}`;
}
