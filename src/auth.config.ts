import type { NextAuthConfig } from "next-auth";
import { isAdminEmail } from "@/lib/admin";

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
  // Own cookie names: localhost shares cookies across ports (3000/3002/3010).
  cookies: {
    sessionToken: { name: "fb-frauen.session-token" },
    callbackUrl: { name: "fb-frauen.callback-url" },
    csrfToken: { name: "fb-frauen.csrf-token" },
  },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
    async jwt({ token }) {
      token.admin = isAdminEmail(typeof token.email === "string" ? token.email : null);
      return token;
    },
    async session({ session, token }) {
      const email = typeof token.email === "string" ? token.email : session.user?.email;
      session.user = {
        ...session.user,
        email: email ?? null,
        admin: Boolean(token.admin),
        id: typeof token.sub === "string" ? token.sub : "",
      };
      return session;
    },
  },
} satisfies NextAuthConfig;