export type Primitive = string | number;

type ResponsiveSchema<M extends string> = Record<M, Primitive>;

export interface Schema<M extends string = never> {
  [key: string]:
    | (Primitive | Schema<M>)
    | (M extends string ? [ResponsiveSchema<M>, Primitive?] : never);
}

export type ResolveSchema<M extends string, S extends Schema<M>> = {
  [Key in keyof S]: S[Key] extends [infer Value, infer DefaultValue]
    ? DefaultValue extends undefined
      ? Value extends ResponsiveSchema<M>
        ? ResponsiveSchema<M>[M]
        : Primitive
      : DefaultValue
    : S[Key] extends Schema<M>
    ? ResolveSchema<M, S[Key]>
    : S[Key];
};

export interface Atoms {
  [customProperty: string]: Primitive;
}

export interface ResponsiveAtoms {
  [mediaQuery: string]: Atoms;
}

export interface FlattenAtoms {
  [key: string]: Primitive | Atoms;
}

export interface AtomizerOptions<M extends string = never> {
  prefixAtoms?: string;
  medias?: Record<M, string>;
}

export interface Atomizer<M extends string, S extends Schema<M>> {
  value: Atoms & M extends string ? ResponsiveAtoms : never;
  reference: ResolveSchema<M, S>;
}

export interface ThemizerOptions<M extends string, T extends Schema>
  extends Required<AtomizerOptions<M>> {
  tokens: T;
}

export interface StyleSheet {
  ':root': Atoms;
}

export interface ResponsiveStyleSheet {
  [mediaQuery: string]: StyleSheet;
}
