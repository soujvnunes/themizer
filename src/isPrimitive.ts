export default function isPrimitive(
  params: unknown,
): params is string | number {
  return typeof params === 'string' || typeof params === 'number';
}
