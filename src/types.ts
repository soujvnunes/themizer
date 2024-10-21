export type Medias<M extends string = never> = {
  [Media in M]: string | number;
};

export interface Schema<M extends string = never> {
  [prop: string]:
    | (string | number | Schema<M>)
    | (M extends string ? [Medias<M>, (string | number)?] : never);
}

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

export interface GeneratedVars<S, M extends string = never> {
  value: Vars & M extends string ? ResponsiveVars : never;
  // TODO: Remove Medias and strings (V extends [infer D, any] ? D extends string | number ? D : D extends object ? ObjectValue<D> : never : never )
  reference: S;
}

export interface ThemeOptions<M extends string, T extends Schema> {
  tokens: T;
  prefixProperties?: string;
  medias?: Record<M, string>;
}
