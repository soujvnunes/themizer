export type Medias<M extends string = never> = {
  [Media in M]: string | number;
};

export interface Schema<M extends string = never> {
  [prop: string]:
    | (string | number | Schema<M>)
    | (M extends string ? [Medias<M>, (string | number)?] : never);
}

type PurifySchema<S extends Schema<string>, M extends string = never> = {
  [Prop in keyof S]: S[Prop] extends [infer Media, infer Default]
    ? Default extends string | number
      ? Default
      : Media extends Medias<M>
      ? Medias<M>[M]
      : never
    : S[Prop] extends Schema<M>
    ? PurifySchema<S[Prop], M>
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
  // TODO: Remove Medias and strings (V extends [infer D, any] ? D extends string | number ? D : D extends object ? ObjectValue<D> : never : never )
  reference: PurifySchema<S, M>;
}

export interface ThemeOptions<M extends string, T extends Schema>
  extends GenerateVarsOptions<M> {
  tokens: T;
}
