export default function unwrap(params: string) {
  return params.match(/--[\w+\-{1}]+/g)?.[0];
}
