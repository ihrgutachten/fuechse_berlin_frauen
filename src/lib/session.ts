import { auth } from "@/auth";
import type { Session } from "next-auth";

export type TipIdentity = {
  userId: string;
  email: string | null;
};

/** `auth()` throws JWTSessionError on foreign/stale cookies. Public pages must not 500. */
export async function getSession(): Promise<Session | null> {
  try {
    return (await auth()) ?? null;
  } catch (err) {
    console.error("[auth] session unreadable:", err instanceof Error ? err.message : err);
    return null;
  }
}

export function tipIdentityFromSession(session: Session | null): TipIdentity | null {
  if (!session?.user) return null;
  const userId = session.user.id?.trim();
  if (!userId) return null;
  return { userId, email: session.user.email ?? null };
}
