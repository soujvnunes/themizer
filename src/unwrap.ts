export default function unwrap(reference: string) {
  return reference.match(/--[\w+\-{1}]+/g)?.[0];
}
