import isPrimitive from './isPrimitive';
import type { FlattenAtoms, ResponsiveStyleSheet } from './types';

export default function getJSS(vars: FlattenAtoms) {
  const jss = Object.entries(vars).reduce(
    (styleSheet, [key, value]) => ({
      ...styleSheet,
      ...(isPrimitive(value)
        ? { ':root': { ...styleSheet[':root'], [key]: value } }
        : { [key]: { ...styleSheet[key], ':root': value } }),
    }),
    {} as ResponsiveStyleSheet,
  );

  return jss;
}
