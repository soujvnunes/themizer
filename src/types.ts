export type ResponsiveSchema<M extends string> = {
  [Media in M]: string | number;
};

export interface Schema<M extends string = never> {
  [prop: string]:
    | (string | number | Schema<M>)
    | (M extends string ? [ResponsiveSchema<M>, (string | number)?] : never);
}

export type PurifySchema<M extends string, S extends Schema<M>> = {
  [Prop in keyof S]: S[Prop] extends [infer Media, infer Default]
    ? Default extends string | number
      ? Default
      : Media extends ResponsiveSchema<M>
      ? ResponsiveSchema<M>[M]
      : never
    : S[Prop] extends Schema<M>
    ? PurifySchema<M, S[Prop]>
    : S[Prop];
};

export interface Vars {
  [key: string]: string | number;
}

export interface ResponsiveVars {
  [key: string]: Vars;
}

export interface GenerateVarsOptions<M extends string = never> {
  prefixProperties?: string;
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
