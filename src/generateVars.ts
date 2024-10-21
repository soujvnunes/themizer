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
): GeneratedVars<S, M> {
  const prefixProperties = options?.prefixProperties
    ? `${options.prefixProperties}${PROPERTIES_UNIFIER}`
    : '';
  const adjustor = __adjustor ? `${__adjustor}${PROPERTIES_UNIFIER}` : '';

  return Object.entries(schema).reduce((generatedVars, [property, value]) => {
    const path = `${prefixProperties}${adjustor}${property}`;
    const finalPath = `--${path}`;

    if (isPrimitive(value)) {
      return {
        ...generatedVars,
        value: {
          ...generatedVars.value,
          [finalPath]: value,
        },
        reference: {
          ...generatedVars.reference,
          [property]: `var(${finalPath}, ${value})`,
        },
      };
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

      return {
        ...generatedVars,
        value: {
          ...generatedVars.value,
          ...(isPrimitive(defaultValue) && {
            [finalPath]: defaultValue,
          }),
          ...RESPONSIVE_VARS,
        },
        reference: {
          ...generatedVars.reference,
          [property]: `var(${finalPath}${resolvedDefaultValue})`,
        },
      };
    }

    const vars = generateVars(
      value,
      {
        prefixProperties: '',
        medias: options?.medias,
      },
      path,
    );

    return {
      ...generatedVars,
      value: {
        ...generatedVars.value,
        ...vars.value,
      },
      reference: {
        ...generatedVars.reference,
        [property]: vars.reference,
      },
    };
  }, {} as GeneratedVars<S, M>);
}
