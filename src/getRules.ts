import isPrimitive from './isPrimitive';
import type { FlattenVars, ResponsiveStyleSheet, Vars } from './types';

export default function getRules(vars: FlattenVars) {
  let resolvedR8eRules = '';

  const r8eVars: Record<string, Vars> = {};
  const rules = Object.entries(vars).reduce((rules, [key, value]) => {
    if (isPrimitive(value)) return `${rules}${key}:${value};`;

    r8eVars[key] = value;

    return rules;
  }, '');
  const r8eRules = Object.entries(r8eVars).reduce(
    (r8eRules, [media, r8eVar]) => {
      for (const [r8eKey, r8eValue] of Object.entries(r8eVar)) {
        resolvedR8eRules += `${r8eKey}:${r8eValue};`;
      }

      const resolvedRules = `${r8eRules}${media}{:root{${resolvedR8eRules}}}`;

      resolvedR8eRules = '';

      return resolvedRules;
    },
    '',
  );

  return {
    css: `:root{${rules}}${r8eRules}`,
    jss: Object.entries(vars).reduce(
      (styleSheet, [key, value]) => ({
        ...styleSheet,
        ...(isPrimitive(value)
          ? { ':root': { ...styleSheet[':root'], [key]: value } }
          : { [key]: { ...styleSheet[key], ':root': value } }),
      }),
      {} as ResponsiveStyleSheet,
    ),
  };
}
