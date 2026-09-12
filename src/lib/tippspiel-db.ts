import { getMatchById } from "@/lib/data";
import { getSql } from "@/lib/db";
import {
  getFinishedTipMatches,
  getTippspielMatches,
  nicknameKey,
  overlayTipMatches,
  predictionPoints,
} from "@/lib/tippspiel";

export type TipProfile = {
  userId: string;
  nickname: string;
  marketingOptIn: boolean;
};

export type TipPrediction = {
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  updatedAt: string;
  nickname: string;
};

export type LeaderboardRow = {
  rank: number;
  userId: string;
  nickname: string;
  homeScore: number | null;
  awayScore: number | null;
  points: number;
  exact: boolean;
  isYou: boolean;
};

export type SeasonRow = {
  rank: number;
  userId: string;
  nickname: string;
  points: number;
  exact: number;
  tipped: number;
  isYou: boolean;
};

export type CommunityTip = {
  count: number;
  homeScore: number;
  awayScore: number;
};

let schemaReady: Promise<void> | null = null;

async function ensureSchema() {
  const sql = getSql();
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS tippspiel_profiles (
          user_id TEXT PRIMARY KEY,
          nickname TEXT NOT NULL,
          nickname_normalized TEXT NOT NULL UNIQUE,
          marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS tippspiel_predictions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          match_id TEXT NOT NULL,
          home_score SMALLINT NOT NULL,
          away_score SMALLINT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (user_id, match_id)
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS tippspiel_predictions_match_id ON tippspiel_predictions (match_id)`;
      await sql`
        CREATE TABLE IF NOT EXISTS tippspiel_match_results (
          match_id TEXT PRIMARY KEY,
          home_score SMALLINT,
          away_score SMALLINT,
          source TEXT NOT NULL DEFAULT 'fmp',
          checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          fetched_at TIMESTAMPTZ
        )
      `;
    })().catch((err: unknown) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

function isUniqueViolation(err: unknown): boolean {
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  ) {
    return true;
  }
  const message = err instanceof Error ? err.message : String(err);
  return /duplicate key|unique constraint|23505/i.test(message);
}

export async function getProfile(userId: string): Promise<TipProfile | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const rows = (await sql`
    SELECT user_id, nickname, marketing_opt_in
    FROM tippspiel_profiles
    WHERE user_id = ${userId}
    LIMIT 1
  `) as Array<{ user_id: string; nickname: string; marketing_opt_in: boolean }>;
  const row = rows[0];
  if (!row) return null;
  return {
    userId: row.user_id,
    nickname: row.nickname,
    marketingOptIn: row.marketing_opt_in,
  };
}

export async function upsertProfile(input: {
  userId: string;
  nickname: string;
  marketingOptIn: boolean;
}): Promise<{ ok: true } | { ok: false; error: "taken" | "db" }> {
  const sql = getSql();
  if (!sql) return { ok: false, error: "db" };
  await ensureSchema();
  const normalized = nicknameKey(input.nickname);
  try {
    await sql`
      INSERT INTO tippspiel_profiles (user_id, nickname, nickname_normalized, marketing_opt_in)
      VALUES (${input.userId}, ${input.nickname}, ${normalized}, ${input.marketingOptIn})
      ON CONFLICT (user_id) DO UPDATE SET
        nickname = EXCLUDED.nickname,
        nickname_normalized = EXCLUDED.nickname_normalized,
        marketing_opt_in = EXCLUDED.marketing_opt_in,
        updated_at = NOW()
    `;
    return { ok: true };
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, error: "taken" };
    console.error("[tippspiel] upsertProfile", err);
    return { ok: false, error: "db" };
  }
}

export async function getPrediction(
  userId: string,
  matchId: string,
): Promise<TipPrediction | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const rows = (await sql`
    SELECT p.user_id, p.match_id, p.home_score, p.away_score, p.updated_at, pr.nickname
    FROM tippspiel_predictions p
    JOIN tippspiel_profiles pr ON pr.user_id = p.user_id
    WHERE p.user_id = ${userId} AND p.match_id = ${matchId}
    LIMIT 1
  `) as Array<{
    user_id: string;
    match_id: string;
    home_score: number;
    away_score: number;
    updated_at: string;
    nickname: string;
  }>;
  const row = rows[0];
  if (!row) return null;
  return mapPrediction(row);
}

export async function upsertPrediction(input: {
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
}): Promise<{ ok: true } | { ok: false; error: "db" }> {
  const sql = getSql();
  if (!sql) return { ok: false, error: "db" };
  await ensureSchema();
  const id = crypto.randomUUID();
  try {
    await sql`
      INSERT INTO tippspiel_predictions (id, user_id, match_id, home_score, away_score)
      VALUES (${id}, ${input.userId}, ${input.matchId}, ${input.homeScore}, ${input.awayScore})
      ON CONFLICT (user_id, match_id) DO UPDATE SET
        home_score = EXCLUDED.home_score,
        away_score = EXCLUDED.away_score,
        updated_at = NOW()
    `;
    return { ok: true };
  } catch (err) {
    console.error("[tippspiel] upsertPrediction", err);
    return { ok: false, error: "db" };
  }
}

export async function countPredictions(matchId: string): Promise<number> {
  const sql = getSql();
  if (!sql) return 0;
  await ensureSchema();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count FROM tippspiel_predictions WHERE match_id = ${matchId}
  `) as Array<{ count: number }>;
  return rows[0]?.count ?? 0;
}

export async function getCommunityTip(matchId: string): Promise<CommunityTip | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const rows = (await sql`
    SELECT
      COUNT(*)::int AS count,
      ROUND(AVG(home_score))::int AS home_score,
      ROUND(AVG(away_score))::int AS away_score
    FROM tippspiel_predictions
    WHERE match_id = ${matchId}
  `) as Array<{ count: number; home_score: number | null; away_score: number | null }>;
  const row = rows[0];
  if (!row || row.count < 1 || row.home_score == null || row.away_score == null) return null;
  return { count: row.count, homeScore: row.home_score, awayScore: row.away_score };
}

export async function getMatchLeaderboard(
  matchId: string,
  viewerId?: string,
): Promise<LeaderboardRow[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureSchema();
  const jsonMatch = getMatchById(matchId);
  const stored = await getStoredMatchResults();
  const match = jsonMatch
    ? overlayTipMatches([jsonMatch], stored)[0]
    : undefined;
  const rows = (await sql`
    SELECT p.user_id, p.home_score, p.away_score, p.updated_at, pr.nickname
    FROM tippspiel_predictions p
    JOIN tippspiel_profiles pr ON pr.user_id = p.user_id
    WHERE p.match_id = ${matchId}
  `) as Array<{
    user_id: string;
    home_score: number;
    away_score: number;
    updated_at: string;
    nickname: string;
  }>;

  const scored = rows.map((row) => {
    const result =
      match && match.homeScore != null && match.awayScore != null
        ? predictionPoints(row.home_score, row.away_score, match.homeScore, match.awayScore)
        : { points: 0, exact: false };
    return {
      userId: row.user_id,
      nickname: row.nickname,
      homeScore: row.home_score,
      awayScore: row.away_score,
      points: result.points,
      exact: result.exact,
      updatedAt: +new Date(row.updated_at),
    };
  });

  scored.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (Number(b.exact) !== Number(a.exact)) return Number(b.exact) - Number(a.exact);
    return a.updatedAt - b.updatedAt;
  });

  return scored.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    nickname: row.nickname,
    homeScore: row.homeScore,
    awayScore: row.awayScore,
    points: row.points,
    exact: row.exact,
    isYou: viewerId != null && row.userId === viewerId,
  }));
}

export async function getSeasonLeaderboard(viewerId?: string): Promise<SeasonRow[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureSchema();
  const stored = await getStoredMatchResults();
  const finished = getFinishedTipMatches(overlayTipMatches(getTippspielMatches(), stored));
  if (!finished.length) return [];

  const rows = (await sql`
    SELECT p.user_id, p.match_id, p.home_score, p.away_score, pr.nickname
    FROM tippspiel_predictions p
    JOIN tippspiel_profiles pr ON pr.user_id = p.user_id
  `) as Array<{
    user_id: string;
    match_id: string;
    home_score: number;
    away_score: number;
    nickname: string;
  }>;

  const byUser = new Map<
    string,
    { nickname: string; points: number; exact: number; tipped: number }
  >();

  for (const row of rows) {
    const match = finished.find((item) => item.id === row.match_id);
    if (!match || match.homeScore == null || match.awayScore == null) continue;
    const result = predictionPoints(
      row.home_score,
      row.away_score,
      match.homeScore,
      match.awayScore,
    );
    const prev = byUser.get(row.user_id) ?? {
      nickname: row.nickname,
      points: 0,
      exact: 0,
      tipped: 0,
    };
    prev.points += result.points;
    prev.exact += result.exact ? 1 : 0;
    prev.tipped += 1;
    prev.nickname = row.nickname;
    byUser.set(row.user_id, prev);
  }

  const ranked = [...byUser.entries()]
    .map(([userId, stats]) => ({ userId, ...stats }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.exact !== a.exact) return b.exact - a.exact;
      return a.nickname.localeCompare(b.nickname, "de");
    });

  return ranked.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    nickname: row.nickname,
    points: row.points,
    exact: row.exact,
    tipped: row.tipped,
    isYou: viewerId != null && row.userId === viewerId,
  }));
}

export async function getTippspielStats(): Promise<{
  profiles: number;
  predictions: number;
} | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const profileRows = (await sql`SELECT COUNT(*)::int AS count FROM tippspiel_profiles`) as Array<{
    count: number;
  }>;
  const predictionRows = (await sql`
    SELECT COUNT(*)::int AS count FROM tippspiel_predictions
  `) as Array<{ count: number }>;
  return {
    profiles: profileRows[0]?.count ?? 0,
    predictions: predictionRows[0]?.count ?? 0,
  };
}

export type OfficialMatchResult = {
  matchId: string;
  homeScore: number;
  awayScore: number;
};

export async function getStoredMatchResults(): Promise<Map<string, { homeScore: number; awayScore: number }>> {
  const sql = getSql();
  const out = new Map<string, { homeScore: number; awayScore: number }>();
  if (!sql) return out;
  await ensureSchema();
  const rows = (await sql`
    SELECT match_id, home_score, away_score
    FROM tippspiel_match_results
    WHERE home_score IS NOT NULL AND away_score IS NOT NULL
  `) as Array<{ match_id: string; home_score: number; away_score: number }>;
  for (const row of rows) {
    out.set(row.match_id, { homeScore: row.home_score, awayScore: row.away_score });
  }
  return out;
}

export async function getResultCheck(
  matchId: string,
): Promise<{ checkedAt: number; hasResult: boolean } | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const rows = (await sql`
    SELECT home_score, away_score, checked_at
    FROM tippspiel_match_results
    WHERE match_id = ${matchId}
    LIMIT 1
  `) as Array<{ home_score: number | null; away_score: number | null; checked_at: string }>;
  const row = rows[0];
  if (!row) return null;
  return {
    checkedAt: +new Date(row.checked_at),
    hasResult: row.home_score != null && row.away_score != null,
  };
}

export async function markResultChecked(matchId: string): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await ensureSchema();
  await sql`
    INSERT INTO tippspiel_match_results (match_id, checked_at)
    VALUES (${matchId}, NOW())
    ON CONFLICT (match_id) DO UPDATE SET
      checked_at = NOW()
    WHERE tippspiel_match_results.home_score IS NULL
  `;
}

export async function saveOfficialResult(
  matchId: string,
  homeScore: number,
  awayScore: number,
): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await ensureSchema();
  await sql`
    INSERT INTO tippspiel_match_results (match_id, home_score, away_score, source, checked_at, fetched_at)
    VALUES (${matchId}, ${homeScore}, ${awayScore}, 'fmp', NOW(), NOW())
    ON CONFLICT (match_id) DO UPDATE SET
      home_score = EXCLUDED.home_score,
      away_score = EXCLUDED.away_score,
      source = EXCLUDED.source,
      checked_at = NOW(),
      fetched_at = NOW()
  `;
}

function mapPrediction(row: {
  user_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  updated_at: string;
  nickname: string;
}): TipPrediction {
  return {
    userId: row.user_id,
    matchId: row.match_id,
    homeScore: row.home_score,
    awayScore: row.away_score,
    updatedAt: row.updated_at,
    nickname: row.nickname,
  };
}
