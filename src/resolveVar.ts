import type { Primitive } from './types';

export default function resolveVar(wrappedVariable: string) {
  const regex =
    /var\((--[\w-]+)(?:,\s*((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))+))?\)/g;

  let match: RegExpMatchArray | null;
  let extractedValue: Primitive | undefined;

  while ((match = regex.exec(wrappedVariable)) !== null) {
    const [, , defaultValue] = match;

    if (defaultValue) {
      if (/^var\(--/.test(defaultValue)) return resolveVar(defaultValue);

      // Removes spaces
      extractedValue = defaultValue.trim();
    }
  }

  if (typeof extractedValue === 'undefined' || extractedValue === '') {
    throw new Error(
      `ui-theme/resolveVar: Expected wrapped custom property '${wrappedVariable}' to have a default value.`,
    );
  }

  const formattedValue = Number(extractedValue);

  return Number.isNaN(formattedValue) ? extractedValue : formattedValue;
}
