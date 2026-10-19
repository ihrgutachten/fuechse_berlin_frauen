import Link from "next/link";
import { PlayerGrid } from "@/components/admin/player-grid";
import { isDatabaseConfigured } from "@/lib/db";
import { listPlayers } from "@/lib/players-db";

export const metadata = { title: "Spielerinnen" };

export default async function AdminTeamPage() {
  const dbReady = isDatabaseConfigured();
  const players = dbReady ? await listPlayers() : null;

  return (
    <div className="mx-auto w-full max-w-[96rem] px-[var(--fb-gutter)] py-12">
      <Link href="/admin" className="text-sm font-semibold text-[var(--fb-accent)] hover:underline">
        ← Backend
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]">
            Backend
          </p>
          <h1 className="mt-2 font-[family-name:var(--fb-font-display)] text-3xl font-bold uppercase tracking-tight">
            Spielerinnen
          </h1>
        </div>
        <Link
          href="/admin/team/new"
          className="rounded-[var(--fb-radius)] bg-[var(--fb-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--fb-accent-hover)]"
        >
          Neue Spielerin
        </Link>
      </div>
      <p className="mt-4 max-w-2xl text-sm text-[var(--fb-text-muted)]">
        Aktive Spielerinnen erscheinen auf der Teamseite. Inaktive bleiben hier, mit grauem Foto,
        und verschwinden aus dem öffentlichen Kader.
      </p>

      {!dbReady || !players ? (
        <p className="mt-8 rounded-[var(--fb-radius-lg)] border border-dashed border-[var(--fb-border)] bg-white p-6 text-sm text-[var(--fb-text-muted)]">
          Keine Datenbank verbunden. DATABASE_URL prüfen.
        </p>
      ) : (
        <PlayerGrid players={players} />
      )}
    </div>
  );
}
