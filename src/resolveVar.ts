export default function resolveVar(wrappedVariable: string) {
  const matched = wrappedVariable
    .matchAll(/,\s(\w+|\d+)\)/gi)
    .toArray()
    .flat();

  if (!matched.length) {
    throw new Error(
      `ui-tokens/resolveVar: Expected wrapped custom property '${wrappedVariable}' to have a default value.`,
    );
  }

  return matched[1];
}
