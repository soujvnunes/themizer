import isPrimitive from './isPrimitive';
import type { FlattenVars } from './types';

let RESPONSIVE_VARS = '';

export default function getRules(vars: FlattenVars) {
  const rules = Object.entries(vars).reduce((rules, [prop, value]) => {
    if (isPrimitive(value)) return `${rules}${prop}:${value};`;

    for (const [responsiveProp, responsiveValue] of Object.entries(value)) {
      RESPONSIVE_VARS += `${responsiveProp}:${responsiveValue};`;
    }

    const resolvedRules = `${rules}${prop}{${RESPONSIVE_VARS}}`;

    RESPONSIVE_VARS = '';

    return resolvedRules;
  }, '');

  return `@layer theme;@layer theme{:root{${rules}}}`;
}
