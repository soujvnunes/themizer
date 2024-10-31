import getVarsResolver from './getVarsResolver';
import isPrimitive from './isPrimitive';
import type {
  GenerateVarsOptions,
  ResponsiveVars,
  Schema,
  GeneratedVars,
} from './types';

const VARS_UNIFIER = '-';
const RESPONSIVE_VARS: ResponsiveVars = {};

export default function generateVars<
  M extends string = never,
  S extends Schema<M> = Schema<M>,
>(
  schema: S,
  options?: GenerateVarsOptions<M>,
  __adjustor?: string,
): GeneratedVars<M, S> {
  const prefixVars = options?.prefixVars
    ? `${options.prefixVars}${VARS_UNIFIER}`
    : '';
  const adjustor = __adjustor ? `${__adjustor}${VARS_UNIFIER}` : '';

  return Object.entries(schema).reduce((generatedVars, [key, value]) => {
    const path = `${prefixVars}${adjustor}${key}`;
    const finalPath = `--${path}`;
    const resolveVars = getVarsResolver<M, S>(generatedVars);

    if (isPrimitive(value)) {
      return resolveVars(
        { [finalPath]: value },
        { [key]: `var(${finalPath}, ${value})` },
      );
    }

    if (Array.isArray(value)) {
      const [medias, defaultValue] = value;
      const resolvedDefaultValue = isPrimitive(defaultValue)
        ? `, ${defaultValue}`
        : '';

      for (const [media, responsiveValue] of Object.entries(medias)) {
        const mediaQuery = options?.medias?.[media as M] as string;

        RESPONSIVE_VARS[mediaQuery] = {
          ...RESPONSIVE_VARS[mediaQuery],
          [finalPath]: responsiveValue,
        };
      }

      return resolveVars(
        {
          ...(isPrimitive(defaultValue) && {
            [finalPath]: defaultValue,
          }),
          ...RESPONSIVE_VARS,
        },
        { [key]: `var(${finalPath}${resolvedDefaultValue})` },
      );
    }

    const vars = generateVars(value, { ...options, prefixVars: '' }, path);

    return resolveVars(vars.value, { [key]: vars.reference });
  }, {} as GeneratedVars<M, S>);
}
