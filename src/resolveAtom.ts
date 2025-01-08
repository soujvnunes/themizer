import type { Primitive } from './types';

export default function resolveAtom(atom: string) {
  const regex =
    /var\((--[\w-]+)(?:,\s*((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))+))?\)/g;

  let match: RegExpMatchArray | null;
  let extractedValue: Primitive | undefined;

  while ((match = regex.exec(atom)) !== null) {
    const [, , defaultValue] = match;

    if (defaultValue) {
      if (/^var\(--/.test(defaultValue)) return resolveAtom(defaultValue);

      extractedValue = defaultValue.trim();
    }
  }

  if (typeof extractedValue === 'undefined' || extractedValue === '') {
    throw new Error(
      `themizer/resolveAtom: Expected wrapped custom property '${atom}' to have a default value.`,
    );
  }

  const formattedValue = Number(extractedValue);

  return Number.isNaN(formattedValue) ? extractedValue : formattedValue;
}
