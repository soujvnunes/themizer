export default function sum(...params: number[]) {
  return params.reduce((acc, cur) => acc + cur, 0);
}
