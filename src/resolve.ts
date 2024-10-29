export default function resolve(wrappedVariable: string) {
  const matched = wrappedVariable
    .matchAll(/,\s(\w+|\d+)\)/gi)
    .toArray()
    .flat();

  if (!matched.length) {
    throw new Error(
      `ui-tokens/resolve: Expected wrapped custom property '${wrappedVariable}' to have a default value.`,
    );
  }

  const defaultValue = matched[1];
  const numberValue = +defaultValue;

  return Number.isNaN(numberValue) ? defaultValue : numberValue;
}
