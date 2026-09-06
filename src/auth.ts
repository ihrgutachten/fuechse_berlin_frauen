import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import NeonAdapter from "@auth/neon-adapter";
import { Pool } from "@neondatabase/serverless";
import { authConfig } from "@/auth.config";
import { sendLoginEmail } from "@/lib/email";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  pool.on("error", (err: Error) => {
    console.error("[db] pool error:", err.message);
  });

  return {
    ...authConfig,
    adapter: NeonAdapter(pool),
    providers: [
      Resend({
        apiKey: process.env.AUTH_RESEND_KEY,
        from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
        async sendVerificationRequest({ identifier, url }) {
          await sendLoginEmail(identifier, url);
        },
      }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
      ...authConfig.callbacks,
      async signIn({ user }) {
        return Boolean(user?.email);
      },
    },
  };
});