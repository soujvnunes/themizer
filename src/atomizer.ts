import getAtomsResolver from './getAtomsResolver';
import isPrimitive from './isPrimitive';
import type {
  AtomizerOptions,
  ResponsiveAtoms,
  Schema,
  Atomizer,
} from './types';

const ATOMS_UNIFIER = '-';
const RESPONSIVE_ATOMS: ResponsiveAtoms = {};

export default function atomizer<M extends string, S extends Schema<M>>(
  schema: S,
  options?: AtomizerOptions<M>,
  __adjustor?: string,
): Atomizer<M, S> {
  const prefixAtoms = options?.prefixAtoms
    ? `${options.prefixAtoms}${ATOMS_UNIFIER}`
    : '';
  const adjustor = __adjustor ? `${__adjustor}${ATOMS_UNIFIER}` : '';

  return Object.entries(schema).reduce((generatedAtoms, [key, value]) => {
    const path = `${prefixAtoms}${adjustor}${key}`;
    const finalPath = `--${path}`;
    const resolveAtoms = getAtomsResolver(generatedAtoms);

    if (isPrimitive(value)) {
      return resolveAtoms(
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

        RESPONSIVE_ATOMS[mediaQuery] = {
          ...RESPONSIVE_ATOMS[mediaQuery],
          [finalPath]: responsiveValue,
        };
      }

      return resolveAtoms(
        {
          ...(isPrimitive(defaultValue) && {
            [finalPath]: defaultValue,
          }),
          ...RESPONSIVE_ATOMS,
        },
        { [key]: `var(${finalPath}${resolvedDefaultValue})` },
      );
    }

    const vars = atomizer(value, { ...options, prefixAtoms: '' }, path);

    return resolveAtoms(vars.value, { [key]: vars.reference });
  }, {} as Atomizer<M, S>);
}
