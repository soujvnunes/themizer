export type Atom = string | number

export default function isAtom(params: unknown): params is Atom {
  return (typeof params === 'string' && !!params) || typeof params === 'number'
}
