/**
 * Pick the singular text for exactly 1, otherwise the plural one, then fill placeholders.
 * plural(1, "Remove 1 follower", "Remove {count} followers", { count: "1" }) -> "Remove 1 follower"
 */
export function plural(
  count: number,
  one: string,
  other: string,
  vars: Record<string, string | number> = {},
): string {
  return format(count === 1 ? one : other, vars);
}

/** Replace `{name}` placeholders: format("Hi {name}", { name: "Pat" }) -> "Hi Pat". */
export function format(
  template: string,
  vars: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
