import { cache } from "react";
import { getSql, isDatabaseConfigured } from "@/lib/db";
import { fetchHbfSnapshot, type HbfOverlayMatch, type HbfSnapshot } from "@/lib/hbf";

let schemaReady: Promise<void> | null = null;

async function ensureSchema() {
  const sql = getSql();
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS hbf_matches (
          id TEXT PRIMARY KEY,
          matches JSONB NOT NULL,
          source TEXT NOT NULL,
          fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((err: unknown) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

function parseMatches(value: unknown): HbfOverlayMatch[] {
  if (Array.isArray(value)) return value as HbfOverlayMatch[];
  try {
    return JSON.parse(String(value)) as HbfOverlayMatch[];
  } catch {
    return [];
  }
}

export async function getStoredHbfSnapshot(): Promise<HbfSnapshot | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const rows = (await sql`
    SELECT matches, source, fetched_at
    FROM hbf_matches
    WHERE id = 'current'
    LIMIT 1
  `) as Array<{ matches: unknown; source: string; fetched_at: string }>;
  const row = rows[0];
  if (!row) return null;
  return {
    matches: parseMatches(row.matches),
    source: row.source,
    fetchedAt: new Date(row.fetched_at).toISOString(),
  };
}

export async function saveHbfSnapshot(snapshot: HbfSnapshot): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await ensureSchema();
  const payload = JSON.stringify(snapshot.matches);
  await sql`
    INSERT INTO hbf_matches (id, matches, source, fetched_at)
    VALUES ('current', ${payload}::jsonb, ${snapshot.source}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      matches = EXCLUDED.matches,
      source = EXCLUDED.source,
      fetched_at = EXCLUDED.fetched_at
  `;
}

export async function syncHbfSnapshot(options: { noStore?: boolean } = {}): Promise<{
  skipped?: string;
  saved?: number;
}> {
  if (!isDatabaseConfigured()) return { skipped: "no-db" };
  const snapshot = await fetchHbfSnapshot(options);
  if (snapshot.matches.length < 16) {
    console.error("[hbf] snapshot small", snapshot.matches.length);
    return { skipped: "parse" };
  }
  await saveHbfSnapshot(snapshot);
  return { saved: snapshot.matches.length };
}

export const getHbfOverlayMatches = cache(async (): Promise<HbfOverlayMatch[]> => {
  const stored = await getStoredHbfSnapshot();
  if (stored?.matches.length) return stored.matches;
  try {
    return (await fetchHbfSnapshot()).matches;
  } catch (err) {
    console.error("[hbf] overlay fetch", err instanceof Error ? err.message : err);
    return [];
  }
});
