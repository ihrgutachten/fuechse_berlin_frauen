const ALLOWED = new Set([
  "/tools/tippspiel",
  "/matchday",
  "/tools",
  "/spielplan",
]);

/** Internal redirect after magic-link login. Rejects /admin and external URLs. */
export function safeCallbackPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path.includes("://") || path.includes("\\")) return null;
  const pathname = path.split("?")[0] ?? path;
  if (!ALLOWED.has(pathname)) return null;
  return pathname;
}

export const TIPPSPIEL_LOGIN_HREF = "/login?next=/tools/tippspiel";
