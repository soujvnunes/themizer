export default function unwrapAtom(wrappedVariable: string) {
  return wrappedVariable.match(/--[\w+\-{1}]+/g)?.[0]
}
