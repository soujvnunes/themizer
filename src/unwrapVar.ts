export default function unwrapVar(wrappedVariable: string) {
  return wrappedVariable.match(/--[\w+\-{1}]+/g)?.[0];
}
