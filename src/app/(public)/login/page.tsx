import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user) redirect("/admin");

  const params = await searchParams;
  const error = params.error;

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!email) return;
    if (!isAdminEmail(email)) {
      redirect("/login?error=AccessDenied");
    }
    try {
      await signIn("resend", {
        email,
        redirectTo: "/admin",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=Configuration");
      }
      throw err;
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-[var(--fb-gutter)] py-16">
      <p className="text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]">
        Backend
      </p>
      <h1 className="mt-2 font-[family-name:var(--fb-font-display)] text-3xl font-bold uppercase tracking-tight text-[var(--fb-ink)]">
        Anmelden
      </h1>
      <p className="mt-3 text-sm text-[var(--fb-text-muted)]">
        Magic-Link per E-Mail — nur freigeschaltete Adressen.
      </p>

      {error ? (
        <p
          className="mt-6 rounded-[var(--fb-radius)] border border-[var(--fb-away-line)] bg-[var(--fb-away-soft)] px-3 py-2 text-sm"
          role="alert"
        >
          {error === "AccessDenied"
            ? "Diese E-Mail ist nicht freigeschaltet."
            : "Anmeldung fehlgeschlagen. Bitte später erneut versuchen."}
        </p>
      ) : null}

      <form action={loginAction} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]"
          >
            E-Mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--fb-accent)] focus:ring-2 focus:ring-[var(--fb-green-100)]"
            placeholder="name@beispiel.de"
          />
        </div>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-[var(--fb-radius)] bg-[var(--fb-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--fb-accent-hover)]"
        >
          Magic-Link senden
        </button>
      </form>
    </div>
  );
}