import { auth } from "@/auth";
import type { Session } from "next-auth";

/** `auth()` throws JWTSessionError on foreign/stale cookies. Public pages must not 500. */
export async function getSession(): Promise<Session | null> {
  try {
    return (await auth()) ?? null;
  } catch (err) {
    console.error("[auth] session unreadable:", err instanceof Error ? err.message : err);
    return null;
  }
}
