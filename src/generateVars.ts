import isPrimitive from './isPrimitive';
import type {
  CSSCustomProperties,
  GenerateVarsOptions,
  Schema,
  Vars,
} from './types';

const PROPERTIES_UNIFIER = '-';
let CSS_CUSTOM_PROPERTIES = {};

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
      const [medias, defaultValue] = value;
      const hasDefaultValue = isPrimitive(defaultValue);
      const resolvedDefaultValue = hasDefaultValue ? `, ${defaultValue}` : '';

      for (const [media, val] of Object.entries(medias)) {
        const mediaQuery = options?.medias?.[media as M] as string;
        const currentMediaQuery = (
          CSS_CUSTOM_PROPERTIES as CSSCustomProperties<M>
        )[mediaQuery];

        if (isPrimitive(currentMediaQuery)) continue;

        CSS_CUSTOM_PROPERTIES = {
          ...CSS_CUSTOM_PROPERTIES,
          [mediaQuery]: {
            ...currentMediaQuery,
            [finalPath]: val,
          },
        };
      }

      return {
        ...generatedVars,
        value: {
          ...generatedVars.value,
          ...(hasDefaultValue && {
            [finalPath]: defaultValue,
          }),
          ...CSS_CUSTOM_PROPERTIES,
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
