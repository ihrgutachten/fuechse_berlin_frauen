import { getSql, isDatabaseConfigured } from "@/lib/db";

export const PLAYER_STATS_SOURCE_URL =
  "https://hbf-cms.deinsportplatz.de/data/players/players_1739.json";

const FUECHSE_FMP_TEAM_ID = "201";
const RECHECK_AFTER_MS = 2 * 60 * 1000;
const TOP_LIMIT = 5;

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: "Torhüterin",
  left_winger: "Linksaußen",
  right_winger: "Rechtsaußen",
  left_back: "Rückraum links",
  right_back: "Rückraum rechts",
  centre_back: "Rückraum Mitte",
  pivot: "Kreis",
};

export type PlayerStatsRow = {
  rank: number;
  name: string;
  firstName: string;
  lastName: string;
  position: string;
  value: number;
  games: number;
  average: number;
  sevenMeterGoals: number;
};

export type PlayerStatsSnapshot = {
  scorers: PlayerStatsRow[];
  keepers: PlayerStatsRow[];
  source: string;
  fetchedAt: string;
};

export type PlayerStatsSyncResult = {
  skipped?: string;
  window?: string;
  saved?: { scorers: number; keepers: number };
};

export type RosterMatch = {
  slug: string;
  name: string;
  photo: string;
  positionLabel: string;
  role: string;
};

export type HydratedTopPlayer = PlayerStatsRow & {
  slug: string | null;
  photo: string | null;
  positionLabel: string;
};

type HbfPlayer = {
  fmpTeamId?: string | number;
  firstName?: string;
  lastName?: string;
  position?: string;
  goals?: number;
  avgGoals?: number;
  sevenMeterGoals?: number;
  seven_m_goals?: number;
  saves?: number;
  games_played?: number;
  totalMatches?: number;
  goals_conceded?: number;
};

let schemaReady: Promise<void> | null = null;

async function ensureSchema() {
  const sql = getSql();
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS league_player_stats (
          id TEXT PRIMARY KEY,
          scorers JSONB NOT NULL,
          keepers JSONB NOT NULL,
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

function nameKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchRosterPlayer(firstName: string, lastName: string, roster: RosterMatch[]): RosterMatch | undefined {
  const full = nameKey(`${firstName} ${lastName}`);
  const exact = roster.find((player) => nameKey(player.name) === full);
  if (exact) return exact;
  const last = nameKey(lastName);
  const firstToken = nameKey(firstName).split(" ")[0];
  return roster.find((player) => {
    const parts = nameKey(player.name).split(" ");
    return parts[0] === firstToken && parts[parts.length - 1] === last;
  });
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function roundAvg(value: number): number {
  return Math.round(value * 10) / 10;
}

function toRow(
  player: HbfPlayer,
  rank: number,
  value: number,
  average: number,
): PlayerStatsRow {
  const firstName = player.firstName?.trim() ?? "";
  const lastName = player.lastName?.trim() ?? "";
  return {
    rank,
    name: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    position: player.position ?? "",
    value,
    games: asNumber(player.games_played ?? player.totalMatches),
    average,
    sevenMeterGoals: asNumber(player.sevenMeterGoals ?? player.seven_m_goals),
  };
}

export function parseHbfPlayerStats(payload: unknown): { scorers: PlayerStatsRow[]; keepers: PlayerStatsRow[] } {
  const root = payload as { playerStatistics?: HbfPlayer[] };
  const list = Array.isArray(root?.playerStatistics) ? root.playerStatistics : [];
  const ours = list.filter((player) => String(player.fmpTeamId) === FUECHSE_FMP_TEAM_ID);

  const scorers = [...ours]
    .filter((player) => asNumber(player.goals) > 0)
    .sort((a, b) => asNumber(b.goals) - asNumber(a.goals) || asNumber(b.avgGoals) - asNumber(a.avgGoals))
    .slice(0, TOP_LIMIT)
    .map((player, index) => {
      const goals = asNumber(player.goals);
      const games = asNumber(player.games_played ?? player.totalMatches);
      const average = asNumber(player.avgGoals) || (games > 0 ? goals / games : 0);
      return toRow(player, index + 1, goals, roundAvg(average));
    });

  const keepers = [...ours]
    .filter((player) => player.position === "goalkeeper" && asNumber(player.saves) > 0)
    .sort(
      (a, b) =>
        asNumber(b.saves) - asNumber(a.saves) ||
        asNumber(b.games_played ?? b.totalMatches) - asNumber(a.games_played ?? a.totalMatches) ||
        asNumber(b.goals_conceded) - asNumber(a.goals_conceded),
    )
    .slice(0, TOP_LIMIT)
    .map((player, index) => {
      const saves = asNumber(player.saves);
      const games = asNumber(player.games_played ?? player.totalMatches);
      return toRow(player, index + 1, saves, roundAvg(games > 0 ? saves / games : 0));
    });

  return { scorers, keepers };
}

function parseJsonRows(value: unknown): PlayerStatsRow[] {
  if (Array.isArray(value)) return value as PlayerStatsRow[];
  try {
    return JSON.parse(String(value)) as PlayerStatsRow[];
  } catch {
    return [];
  }
}

export async function getPlayerStatsSnapshot(): Promise<PlayerStatsSnapshot | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const rows = (await sql`
    SELECT scorers, keepers, source, fetched_at
    FROM league_player_stats
    WHERE id = 'current'
    LIMIT 1
  `) as Array<{ scorers: unknown; keepers: unknown; source: string; fetched_at: string }>;
  const row = rows[0];
  if (!row) return null;
  return {
    scorers: parseJsonRows(row.scorers),
    keepers: parseJsonRows(row.keepers),
    source: row.source,
    fetchedAt: new Date(row.fetched_at).toISOString(),
  };
}

export function hydrateTopPlayers(
  snapshot: PlayerStatsSnapshot,
  roster: RosterMatch[],
): { scorers: HydratedTopPlayer[]; keepers: HydratedTopPlayer[]; fetchedAt: string; source: string } {
  const spielerinnen = roster.filter((player) => player.role === "spielerin");
  const attach = (row: PlayerStatsRow): HydratedTopPlayer => {
    const match = matchRosterPlayer(row.firstName, row.lastName, spielerinnen);
    return {
      ...row,
      slug: match?.slug ?? null,
      photo: match?.photo ?? null,
      positionLabel: match?.positionLabel || POSITION_LABEL[row.position] || row.position,
    };
  };
  return {
    scorers: snapshot.scorers.map(attach),
    keepers: snapshot.keepers.map(attach),
    fetchedAt: snapshot.fetchedAt,
    source: snapshot.source,
  };
}

async function savePlayerStats(snapshot: Omit<PlayerStatsSnapshot, "fetchedAt">) {
  const sql = getSql();
  if (!sql) return;
  await ensureSchema();
  const scorers = JSON.stringify(snapshot.scorers);
  const keepers = JSON.stringify(snapshot.keepers);
  await sql`
    INSERT INTO league_player_stats (id, scorers, keepers, source, fetched_at)
    VALUES ('current', ${scorers}::jsonb, ${keepers}::jsonb, ${snapshot.source}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      scorers = EXCLUDED.scorers,
      keepers = EXCLUDED.keepers,
      source = EXCLUDED.source,
      fetched_at = EXCLUDED.fetched_at
  `;
}

const PLAYER_STATS_WINDOW_MS = 6 * 60 * 60 * 1000;

export function playerStatsWindowAt(
  now: number,
  matches: Array<{ startsAt: string; status: string }>,
): boolean {
  return matches.some((match) => {
    if (match.status !== "finished" && match.status !== "live") return false;
    const kickoff = Date.parse(match.startsAt);
    return now >= kickoff && now <= kickoff + PLAYER_STATS_WINDOW_MS;
  });
}

export async function syncPlayerStatsIfInWindow(
  now = Date.now(),
  matches: Array<{ startsAt: string; status: string }> = [],
): Promise<PlayerStatsSyncResult> {
  if (!isDatabaseConfigured()) return { skipped: "no-db" };
  const previous = await getPlayerStatsSnapshot();
  const inWindow = playerStatsWindowAt(now, matches);
  if (!inWindow && previous) return { skipped: "outside-window" };

  if (previous && now - Date.parse(previous.fetchedAt) < RECHECK_AFTER_MS) {
    return { skipped: "recent" };
  }

  const res = await fetch(PLAYER_STATS_SOURCE_URL, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (compatible; FuechseBerlinFrauen/1.0; +https://fuechse-berlin-frauen.de)",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[player-stats] fetch", res.status);
    return { skipped: `http-${res.status}` };
  }

  const parsed = parseHbfPlayerStats(await res.json());
  if (parsed.scorers.length === 0) {
    console.error("[player-stats] parse empty");
    return { skipped: "parse" };
  }

  await savePlayerStats({ ...parsed, source: "hbf" });
  return {
    saved: { scorers: parsed.scorers.length, keepers: parsed.keepers.length },
  };
}
