/** Exhaustiveness helper for switch statements over union types. */
export function assertNever(x: never, label = 'value'): never {
  throw new Error(`Unexpected ${label}: ${JSON.stringify(x)}`);
}

export function isDefined<T>(v: T | null | undefined): v is T {
  return v !== null && v !== undefined;
}
