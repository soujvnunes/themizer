import isPrimitive from './isPrimitive';
import type {
  GenerateVarsOptions,
  ResponsiveCSSCustomProperties,
  Schema,
  Vars,
} from './types';

const PROPERTIES_UNIFIER = '-';
const RESPONSIVE_VARS: ResponsiveCSSCustomProperties = {};

export default function generateVars<
  M extends string = never,
  S extends Schema<M> = Schema<M>,
>(
  schema: S,
  options?: GenerateVarsOptions<M>,
  __adjustor?: string,
): Vars<S, M> {
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
      if (typeof options?.medias === 'undefined') return generatedVars;

      const [medias, defaultValue] = value;
      const resolvedDefaultValue = isPrimitive(defaultValue)
        ? `, ${defaultValue}`
        : '';

      for (const [media, val] of Object.entries(medias)) {
        const mediaQuery = options.medias[media as M];

        RESPONSIVE_VARS[mediaQuery] = {
          ...RESPONSIVE_VARS[mediaQuery],
          [finalPath]: val,
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
  }, {} as Vars<S, M>);
}
