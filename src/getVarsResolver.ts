import type {
  GeneratedVars,
  Primitive,
  ResolveSchema,
  Schema,
  Vars,
} from './types';

export default function getVarsResolver<M extends string, S extends Schema<M>>(
  generatedVars: GeneratedVars<M, S>,
) {
  return (
    value: Record<string, Vars | Primitive>,
    reference: Record<string, ResolveSchema<M, Schema<M>> | string>,
  ) => ({
    ...generatedVars,
    value: { ...generatedVars.value, ...value },
    reference: { ...generatedVars.reference, ...reference },
  });
}
