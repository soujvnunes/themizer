import isPrimitive from './isPrimitive';
import type { ResponsiveStyleSheet, StyleSheet } from './types';

export default function getCSSFromJSS(
  jss: StyleSheet | ResponsiveStyleSheet,
  __isRoot?: boolean,
) {
  let css = __isRoot ? ':root{' : '';

  for (const [key, value] of Object.entries(jss)) {
    if (isPrimitive(value)) css += `${key}:${value};`;
    else css += `${key}{${getCSSFromJSS(value, false)}}`;
  }

  if (__isRoot) css += '}';

  return css;
}
