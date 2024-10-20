export type Medias<M extends string = never> = {
  [Media in M]: string | number;
};

export interface Schema<M extends string = never> {
  [prop: string]:
    | (string | number | Schema<M>)
    | (M extends string ? [Medias<M>, (string | number)?] : never);
}

export interface CSSCustomProperties {
  [key: string]: string | number;
}

export interface ResponsiveCSSCustomProperties {
  [key: string]: CSSCustomProperties;
}

export interface GenerateVarsOptions<M extends string = never> {
  prefixProperties?: string;
  medias?: {
    [Media in M]: string;
  };
}

export interface Vars<S, M extends string = never> {
  value: CSSCustomProperties & M extends string
    ? ResponsiveCSSCustomProperties
    : never;
  // TODO: Remove Medias and strings (V extends [infer D, any] ? D extends string | number ? D : D extends object ? ObjectValue<D> : never : never )
  reference: S;
}

export interface ThemeOptions<M extends string, T extends Schema<M>> {
  tokens: T;
  prefixProperties?: string;
  medias?: Record<M, string>;
}
