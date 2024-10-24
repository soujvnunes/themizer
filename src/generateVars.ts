import getVarsResolver from './getVarsResolver';
import isPrimitive from './isPrimitive';
import type {
  GenerateVarsOptions,
  ResponsiveVars,
  Schema,
  GeneratedVars,
} from './types';

const PROPERTIES_UNIFIER = '-';
const RESPONSIVE_VARS: ResponsiveVars = {};

export default function generateVars<
  M extends string = never,
  S extends Schema<M> = Schema<M>,
>(
  schema: S,
  options?: GenerateVarsOptions<M>,
  __adjustor?: string,
): GeneratedVars<M, S> {
  const prefixProperties = options?.prefixProperties
    ? `${options.prefixProperties}${PROPERTIES_UNIFIER}`
    : '';
  const adjustor = __adjustor ? `${__adjustor}${PROPERTIES_UNIFIER}` : '';

  return Object.entries(schema).reduce((generatedVars, [property, value]) => {
    const path = `${prefixProperties}${adjustor}${property}`;
    const finalPath = `--${path}`;
    const resolveVars = getVarsResolver<M, S>(generatedVars);

    if (isPrimitive(value)) {
      return resolveVars(
        { [finalPath]: value },
        { [property]: `var(${finalPath}, ${value})` },
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
        { [property]: `var(${finalPath}${resolvedDefaultValue})` },
      );
    }

    const vars = generateVars(
      value,
      { ...options, prefixProperties: '' },
      path,
    );

    return resolveVars(vars.value, { [property]: vars.reference });
  }, {} as GeneratedVars<M, S>);
}
