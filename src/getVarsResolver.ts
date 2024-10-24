import type { GeneratedVars, Primitive, Schema, Vars } from './types';

export default function getVarsResolver<
  M extends string = never,
  S extends Schema<M> = Schema<M>,
>(generatedVars: GeneratedVars<M, S>) {
  return (value: Record<string, Vars | Primitive>, reference: Schema<M>) => ({
    ...generatedVars,
    value: {
      ...generatedVars.value,
      ...value,
    },
    reference: {
      ...generatedVars.reference,
      ...reference,
    },
  });
}
