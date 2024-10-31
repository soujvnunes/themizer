export default function resolveVar(wrappedVariable: string) {
  const matched = wrappedVariable
    .matchAll(
      /,\s(\w+|(\d+(\s|\w+)?)+|#[a-f0-9]{3,6}|(calc|rg(b|a)|cubic-bezier)\(.+\))\)/gi,
    )
    .toArray()
    .flat();

  if (!matched.length) {
    throw new Error(
      `ui-tokens/resolveVar: Expected wrapped custom property '${wrappedVariable}' to have a default value.`,
    );
  }

  return matched[1];
}
