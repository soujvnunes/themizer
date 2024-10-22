export type Primitive = string | number;

export type ResponsiveSchema<M extends string> = {
  [Media in M]: Primitive;
};

export interface Schema<M extends string = never> {
  [prop: string]:
    | (Primitive | Schema<M>)
    | (M extends string ? [ResponsiveSchema<M>, Primitive?] : never);
}

export type PurifySchema<M extends string, S extends Schema<M>> = {
  [Prop in keyof S]: S[Prop] extends any[]
    ? string
    : S[Prop] extends Schema<M>
    ? PurifySchema<M, S[Prop]>
    : S[Prop];
};

export interface Vars {
  [key: string]: Primitive;
}

export interface ResponsiveVars {
  [key: string]: Vars;
}

export interface GenerateVarsOptions<M extends string = never> {
  prefixProperties?: string;
  // TODO: add selectors
  medias?: {
    [Media in M]: string;
  };
}

export interface GeneratedVars<S extends Schema<M>, M extends string = never> {
  value: Vars & M extends string ? ResponsiveVars : never;
  reference: PurifySchema<M, S>;
}

export interface ThemeOptions<M extends string, T extends Schema>
  extends GenerateVarsOptions<M> {
  tokens?: T;
}
