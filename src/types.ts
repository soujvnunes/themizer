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

export interface Vars {
  [customProperty: string]: Primitive;
}

export interface ResponsiveVars {
  [mediaQuery: string]: Vars;
}

export interface FlattenVars {
  [key: string]: Primitive | Vars;
}

export interface GenerateVarsOptions<M extends string = never> {
  prefixVars?: string;
  medias?: Record<M, string>;
}

export interface GeneratedVars<M extends string, S extends Schema<M>> {
  value: Vars & M extends string ? ResponsiveVars : never;
  reference: ResolveSchema<M, S>;
}

export interface ThemeOptions<M extends string, T extends Schema>
  extends Required<GenerateVarsOptions<M>> {
  tokens: T;
}

export interface StyleSheet {
  ':root': Vars;
}

export interface ResponsiveStyleSheet {
  [mediaQuery: string]: StyleSheet;
}
