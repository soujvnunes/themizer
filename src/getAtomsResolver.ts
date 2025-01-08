import type {
  Atomizer,
  Primitive,
  ResolveSchema,
  Schema,
  Atoms,
} from './types';

export default function getAtomsResolver<M extends string, S extends Schema<M>>(
  generatedAtoms: Atomizer<M, S>,
) {
  return (
    value: Record<string, Atoms | Primitive>,
    reference: Record<string, ResolveSchema<M, Schema<M>> | string>,
  ) => ({
    ...generatedAtoms,
    value: { ...generatedAtoms.value, ...value },
    reference: { ...generatedAtoms.reference, ...reference },
  });
}
