import Image from "next/image";
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

  const actionClass =
    "mt-5 inline-flex rounded-[var(--fb-radius)] bg-[var(--fb-green-700)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--fb-green-800)]";

  return (
    <div>
      <header className="bg-[var(--fb-green-950)] px-[var(--fb-gutter)] py-8 text-white md:py-10">
        <div className="mx-auto flex max-w-[var(--fb-container)] items-center gap-5">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo-fuechse-berlin-frauen.png"
              alt="Füchse Berlin Frauen"
              width={140}
              height={160}
              priority
              className="h-20 w-auto md:h-24"
            />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-green-300)]">
              Backend
            </p>
            <h1 className="mt-2 font-[family-name:var(--fb-font-display)] text-4xl font-extrabold uppercase leading-none tracking-tight md:text-5xl">
              Admin
            </h1>
            <p className="mt-3 text-white/80">
              Angemeldet als <strong className="text-white">{session?.user?.email}</strong>
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[var(--fb-container)] space-y-4 px-[var(--fb-gutter)] py-10">
        <section className="rounded-[var(--fb-radius-lg)] border-2 border-[var(--fb-green-950)] bg-white p-6">
          <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase">
            Module
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--fb-ink-2)]">
            Funktionsbereiche der Seite an- und abschalten, etwa den Aufstiegs-Rechner.
            Abgeschaltete Module verschwinden aus der Navigation.
          </p>
          <Link href="/admin/modules" className={actionClass}>
            Module verwalten
          </Link>
        </section>

        <section className="rounded-[var(--fb-radius-lg)] border-2 border-[var(--fb-green-950)] bg-white p-6">
          <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase">
            News
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--fb-ink-2)]">
            Spielberichte, Vorberichte und Meldungen pflegen. Mit Titelbild und Text.
          </p>
          <Link href="/admin/news" className={actionClass}>
            News verwalten
          </Link>
        </section>

        <section className="rounded-[var(--fb-radius-lg)] border-2 border-[var(--fb-green-950)] bg-white p-6">
          <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase">
            Tippspiel
          </h2>
          {stats ? (
            <p className="mt-3 text-[var(--fb-ink-2)]">
              {stats.profiles} {stats.profiles === 1 ? "Konto" : "Konten"} · {stats.predictions}{" "}
              {stats.predictions === 1 ? "Tipp" : "Tipps"}
            </p>
          ) : (
            <p className="mt-3 text-[var(--fb-ink-2)]">Zahlen nicht verfügbar. DATABASE_URL prüfen.</p>
          )}
          <Link href="/tools/tippspiel" className={actionClass}>
            Zum Tippspiel
          </Link>
        </section>

        <p className="rounded-[var(--fb-radius-lg)] border-2 border-[var(--fb-green-800)] bg-white p-6 text-[var(--fb-ink-2)]">
          Magic-Link-Login steht. Hier kommen später Bestellungen, Inhalte und weitere
          Backend-Funktionen hin.
        </p>

        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-[var(--fb-radius)] border-2 border-[var(--fb-ink)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--fb-ink)] transition hover:bg-[var(--fb-ink)] hover:text-white"
          >
            Abmelden
          </button>
        </form>
      </div>
    </div>
  );
}
