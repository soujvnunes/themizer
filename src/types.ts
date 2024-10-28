export type Primitive = string | number;

export interface Schema<M extends string = never> {
  [prop: string]:
    | (Primitive | Schema<M>)
    | (M extends string ? [Record<M, Primitive>, Primitive?] : never);
}

export type ResolveResponsiveSchema<M extends string, S extends Schema<M>> = {
  [Key in keyof S]: S[Key] extends [infer ResponsiveMedia, infer DefaultValue]
    ? DefaultValue extends Primitive
      ? DefaultValue
      : ResponsiveMedia extends Primitive
      ? ResponsiveMedia
      : never
    : S[Key] extends Schema<M>
    ? ResolveResponsiveSchema<M, S[Key]>
    : S[Key];
};

export interface Vars {
  [key: string]: Primitive;
}

export interface ResponsiveVars {
  [key: string]: Vars;
}

export interface FlattenVars {
  [key: string]: Primitive | Vars;
}

export interface GenerateVarsOptions<M extends string = never> {
  prefixProperties?: string;
  medias?: Record<M, string>;
}

export interface GeneratedVars<M extends string, S extends Schema<M>> {
  value: Vars & M extends string ? ResponsiveVars : never;
  reference: ResolveResponsiveSchema<M, S>;
}

export interface ThemeOptions<M extends string, T extends Schema>
  extends GenerateVarsOptions<M> {
  tokens?: T;
}
