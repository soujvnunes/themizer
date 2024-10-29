export default function unwrap(wrappedVariable: string) {
  return wrappedVariable.match(/--[\w+\-{1}]+/g)?.[0];
}
