import { getSql, isDatabaseConfigured } from "@/lib/db";

export const STANDINGS_SOURCE_URL =
  "https://www.sport.de/handball/deutschland-dhb-2-bundesliga-frauen/ergebnisse-und-tabelle/";

const RECHECK_AFTER_MS = 2 * 60 * 1000;

/** 4. Spieltag test: Anpfiff + 70 min, then the next full hour. Europe/Berlin. */
const TEST_WINDOWS = [
  { start: "2026-09-19T19:10:00+02:00", end: "2026-09-19T20:00:00+02:00", label: "Sa 19:10-20:00" },
  { start: "2026-09-19T20:10:00+02:00", end: "2026-09-19T21:00:00+02:00", label: "Sa 20:10-21:00" },
  { start: "2026-09-20T17:10:00+02:00", end: "2026-09-20T18:00:00+02:00", label: "So 17:10-18:00" },
] as const;

const SLUG_ALIAS: Record<string, string> = {
  "1-fsv-mainz-05": "mainz-05",
  "esv-1927-regensburg": "esv-regensburg",
  "hl-buchholz-08-rosengarten": "hl-buchholz-rosengarten",
  "sg-09-kirchhof": "sg-kirchhof",
  "rostocker-handball-club": "rostocker-hc",
  "sv-werder-bremen": "werder-bremen",
};

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
  window?: string;
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

export function standingsWindowAt(now = Date.now()): (typeof TEST_WINDOWS)[number] | undefined {
  return TEST_WINDOWS.find((window) => {
    const start = Date.parse(window.start);
    const end = Date.parse(window.end);
    return now >= start && now <= end;
  });
}

function mapSlug(sportSlug: string): string {
  return SLUG_ALIAS[sportSlug] ?? sportSlug;
}

export function parseSportDeStandings(html: string): StandingRecord[] {
  const rowRe = /<tr class="[^"]*standing standing-\d+"[^>]*>([\s\S]*?)<\/tr>/g;
  const rows: StandingRecord[] = [];
  let match: RegExpExecArray | null;
  while ((match = rowRe.exec(html))) {
    const row = match[1];
    const rank = Number(row.match(/class="standing-rank">(\d+)/)?.[1]);
    const sportSlug = row.match(/\/handball\/te\d+\/([^/]+)\//)?.[1];
    const played = Number(row.match(/class="standing-games_played">(\d+)/)?.[1]);
    const won = Number(row.match(/class="standing-win">(\d+)/)?.[1]);
    const draw = Number(row.match(/class="standing-draw">(\d+)/)?.[1]);
    const lost = Number(row.match(/class="standing-lost">(\d+)/)?.[1]);
    const goals = row.match(/class="standing-goaldiff">(\d+):(\d+)/);
    const points = Number(row.match(/class="standing-points">(\d+):\d+/)?.[1]);
    if (!sportSlug || !Number.isFinite(rank) || !goals) continue;
    rows.push({
      rank,
      teamSlug: mapSlug(sportSlug),
      played,
      won,
      draw,
      lost,
      goalsFor: Number(goals[1]),
      goalsAgainst: Number(goals[2]),
      points,
    });
  }
  return rows;
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

export async function syncStandingsIfInWindow(now = Date.now()): Promise<StandingsSyncResult> {
  if (!isDatabaseConfigured()) return { skipped: "no-db" };
  const window = standingsWindowAt(now);
  if (!window) return { skipped: "outside-window" };

  const previous = await getStandingsSnapshot();
  if (previous && now - Date.parse(previous.fetchedAt) < RECHECK_AFTER_MS) {
    return { skipped: "recent", window: window.label };
  }

  const res = await fetch(STANDINGS_SOURCE_URL, {
    headers: {
      Accept: "text/html",
      "User-Agent":
        "Mozilla/5.0 (compatible; FuechseBerlinFrauen/1.0; +https://fuechse-berlin-frauen.de)",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[standings] fetch", res.status);
    return { skipped: `http-${res.status}`, window: window.label };
  }

  const records = parseSportDeStandings(await res.text());
  if (records.length !== 16) {
    console.error("[standings] parse", records.length);
    return { skipped: "parse", window: window.label };
  }

  await saveStandings(records, "sport.de");
  return { saved: records.length, window: window.label };
}
