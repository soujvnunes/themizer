import isPrimitive from './isPrimitive';
import type { FlattenVars } from './types';

let RESPONSIVE_VARS = '';

export default function getRules(vars: FlattenVars): string {
  const rules = Object.entries(vars).reduce((rules, [prop, value]) => {
    if (isPrimitive(value)) return `${rules}${prop}:${value};`;

    for (const [responsiveProp, responsiveValue] of Object.entries(value)) {
      RESPONSIVE_VARS += `${responsiveProp}:${responsiveValue};`;
    }

    return `${rules}${prop}{${RESPONSIVE_VARS}}`;
  }, '');

  return `@layer theme;@layer theme{:root{${rules}}}`;
}
