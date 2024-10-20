export type Medias<M extends string = never> = {
  [Media in M]: string | number;
};

export interface Schema<M extends string = never> {
  [prop: string]:
    | (string | number | Schema<M>)
    | (M extends string ? [Medias<M>, (string | number)?] : never);
}

export interface CSSCustomProperties<M extends string = never> {
  [key: string]:
    | string
    | number
    | (M extends string ? Record<string, string | number> : never);
}

export interface GenerateVarsOptions<M extends string = never> {
  prefixProperties?: string;
  medias?: {
    [Media in M]: string;
  };
}

export interface Vars<S, M extends string = never> {
  value: CSSCustomProperties<M>;
  // TODO: Remove Medias and strings (V extends [infer D, any] ? D extends string | number ? D : D extends object ? ObjectValue<D> : never : never )
  reference: S;
}

export interface ThemeOptions<M extends string, T extends Schema<M>> {
  tokens: T;
  prefixProperties?: string;
  medias?: Record<M, string>;
}
