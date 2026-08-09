import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe base config (no DB adapter, no email provider).
 * Used by middleware and auth.ts.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;