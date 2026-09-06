import Link from "next/link";
import { signOut } from "@/auth";
import { getSession } from "@/lib/session";
import { getTippspielStats } from "@/lib/tippspiel-db";

export default async function AdminPage() {
  const session = await getSession();
  let stats: Awaited<ReturnType<typeof getTippspielStats>> = null;
  try {
    stats = await getTippspielStats();
  } catch (err) {
    console.error("[admin] tippspiel stats", err);
  }

  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-12">
      <p className="text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]">
        Backend
      </p>
      <h1 className="mt-2 font-[family-name:var(--fb-font-display)] text-3xl font-bold uppercase tracking-tight">
        Admin
      </h1>
      <p className="mt-3 text-sm text-[var(--fb-text-muted)]">
        Angemeldet als <strong>{session?.user?.email}</strong>
      </p>

      <section className="mt-8 rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white p-6">
        <h2 className="font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase">
          Tippspiel
        </h2>
        {stats ? (
          <p className="mt-3 text-sm text-[var(--fb-text-muted)]">
            {stats.profiles} {stats.profiles === 1 ? "Konto" : "Konten"} · {stats.predictions}{" "}
            {stats.predictions === 1 ? "Tipp" : "Tipps"}
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--fb-text-muted)]">
            Zahlen nicht verfügbar. DATABASE_URL prüfen.
          </p>
        )}
        <Link
          href="/tools/tippspiel"
          className="mt-4 inline-flex text-sm font-semibold text-[var(--fb-accent)] hover:underline"
        >
          Zum Tippspiel
        </Link>
      </section>

      <p className="mt-6 rounded-[var(--fb-radius-lg)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] p-6 text-sm text-[var(--fb-text-muted)]">
        Magic-Link-Login steht. Hier kommen später Bestellungen, Inhalte und weitere
        Backend-Funktionen hin.
      </p>
      <form action={logoutAction} className="mt-8">
        <button
          type="submit"
          className="rounded-[var(--fb-radius)] border border-[var(--fb-border)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--fb-accent)]"
        >
          Abmelden
        </button>
      </form>
    </div>
  );
}
