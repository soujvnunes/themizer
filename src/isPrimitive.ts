import type { Primitive } from './types';

export default function isPrimitive(params: unknown): params is Primitive {
  return typeof params === 'string' || typeof params === 'number';
}
