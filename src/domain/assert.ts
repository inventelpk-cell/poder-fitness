export function assertNever(value: never, label = 'valor'): never {
  throw new Error(`No contemplado (${label}): ${JSON.stringify(value)}`);
}
