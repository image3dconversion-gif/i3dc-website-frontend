/**
 * Build-time refusal of unsafe Meta configuration. PURE — used by next.config.ts.
 *
 * A Vercel Production build carrying a Test Events code fails outright, so a UAT
 * value can never reach the live site. Runtime refuses the same configuration in
 * lib/meta/config.ts; this catches it before anything is published.
 */
export type BuildEnv = Readonly<Record<string, string | undefined>>;

/** Variable names only: a value must never appear in a build log. */
export function metaBuildProblems(env: BuildEnv): string[] {
  const problems: string[] = [];
  if (env.VERCEL_ENV === "production" && (env.META_TEST_EVENT_CODE ?? "").trim()) {
    problems.push("META_TEST_EVENT_CODE is forbidden in a Production build");
  }
  return problems;
}
