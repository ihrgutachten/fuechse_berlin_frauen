import { getSql, isDatabaseConfigured } from "@/lib/db";
import { computeStandings, type HbfOverlayMatch } from "@/lib/hbf";

export type StandingRecord = {
  rank: number;
  teamSlug: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

export type StandingsSnapshot = {
  rows: StandingRecord[];
  source: string;
  fetchedAt: string;
};

export type StandingsSyncResult = {
  skipped?: string;
  saved?: number;
};

let schemaReady: Promise<void> | null = null;

async function ensureSchema() {
  const sql = getSql();
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS league_standings (
          id TEXT PRIMARY KEY,
          rows JSONB NOT NULL,
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

export async function getStandingsSnapshot(): Promise<StandingsSnapshot | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const rows = (await sql`
    SELECT rows, source, fetched_at
    FROM league_standings
    WHERE id = 'current'
    LIMIT 1
  `) as Array<{ rows: StandingRecord[]; source: string; fetched_at: string }>;
  const row = rows[0];
  if (!row) return null;
  const parsedRows = Array.isArray(row.rows)
    ? row.rows
    : (JSON.parse(String(row.rows)) as StandingRecord[]);
  return {
    rows: parsedRows,
    source: row.source,
    fetchedAt: new Date(row.fetched_at).toISOString(),
  };
}

export async function getStoredStandings(): Promise<StandingRecord[] | null> {
  const snapshot = await getStandingsSnapshot();
  return snapshot?.rows ?? null;
}

async function saveStandings(records: StandingRecord[], source: string) {
  const sql = getSql();
  if (!sql) return;
  await ensureSchema();
  const payload = JSON.stringify(records);
  await sql`
    INSERT INTO league_standings (id, rows, source, fetched_at)
    VALUES ('current', ${payload}::jsonb, ${source}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      rows = EXCLUDED.rows,
      source = EXCLUDED.source,
      fetched_at = EXCLUDED.fetched_at
  `;
}

export async function syncStandingsFromHbf(matches: HbfOverlayMatch[]): Promise<StandingsSyncResult> {
  if (!isDatabaseConfigured()) return { skipped: "no-db" };
  const records = computeStandings(matches);
  if (records.length !== 16) {
    console.error("[standings] parse", records.length);
    return { skipped: "parse" };
  }
  await saveStandings(records, "hbf");
  return { saved: records.length };
}
