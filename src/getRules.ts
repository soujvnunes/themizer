import isPrimitive from './isPrimitive';
import type { Vars, Primitive } from './types';

let RESPONSIVE_PROPS = '';

export default function getRules(vars?: {
  [key: string]: Primitive | Vars;
}): string {
  if (typeof vars === 'undefined') return '';

  return Object.entries(vars).reduce((rules, [prop, value]) => {
    if (isPrimitive(value)) return `${rules}\n${prop}: ${value};`;

    const responsiveProps = Object.entries(value);

    for (let index = 0; index < responsiveProps.length; index++) {
      const [responsiveProp, responsiveValue] = responsiveProps[index];

      RESPONSIVE_PROPS += `\t${responsiveProp}: ${responsiveValue};\n`;
    }

    return `${rules}\n${prop} {\n${RESPONSIVE_PROPS}}\n`;
  }, '');
}
