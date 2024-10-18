export type CSSCustomProperties = {
  [key: string]: string | number;
};

export interface Vars<Aliases extends object> {
  value: CSSCustomProperties;
  aliases: Aliases;
}

export interface ThemeOptions<Tokens extends object = object> {
  tokens: Tokens;
  prefixKeys?: string;
}
