import type { ThemeOptions, Vars } from './types';

export default function generateVars<Aliases extends object>(
  aliases: Aliases,
  options?: Omit<ThemeOptions, 'tokens'>,
  __adjustor?: string,
): Vars<Aliases> {
  return Object.entries(aliases).reduce((acc, [key, value]) => {
    const keysUnifier = '-';
    const prefixKeys = options?.prefixKeys
      ? `${options.prefixKeys}${keysUnifier}`
      : '';
    const adjustor = __adjustor ? `${__adjustor}${keysUnifier}` : '';
    const path = `${prefixKeys}${adjustor}${key}`;
    const finalPath = `--${path}`;

    if (typeof value === 'object' && value != null) {
      const vars = generateVars(
        value,
        {
          prefixKeys: '',
        },
        path,
      );

      return {
        ...acc,
        value: {
          ...acc.value,
          ...vars.value,
        },
        aliases: {
          ...acc.aliases,
          [key]: vars.aliases,
        },
      };
    }

    return {
      ...acc,
      value: {
        ...acc.value,
        [finalPath]: value,
      },
      aliases: {
        ...acc.aliases,
        [key]: `var(${finalPath}, ${value})`,
      },
    };
  }, {} as Vars<Aliases>);
}
