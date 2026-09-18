import type { Match } from "@/lib/data";
import { getLiveMatches } from "@/lib/data";
import { isDatabaseConfigured } from "@/lib/db";
import { officialEndstand, type HbfOverlayMatch } from "@/lib/hbf";
import {
  applyOfficialResult,
  getLastFinishedTipMatch,
  getTipPhase,
  getTippspielFeaturedMatch,
  getTippspielMatches,
  isTipLocked,
  overlayTipMatches,
} from "@/lib/tippspiel";
import {
  getResultCheck,
  getStoredMatchResults,
  markResultChecked,
  saveOfficialResult,
} from "@/lib/tippspiel-db";

const RECHECK_AFTER_MS = 2 * 60 * 1000;

export type HydratedTippspiel = {
  matches: Match[];
  featured: Match | undefined;
  lastFinished: Match | undefined;
};

export async function hydrateTippspiel(now = Date.now()): Promise<HydratedTippspiel> {
  const stored = isDatabaseConfigured() ? await getStoredMatchResults() : new Map();
  const catalog = await getLiveMatches();
  let matches = overlayTipMatches(getTippspielMatches(catalog), stored);
  let featured = getTippspielFeaturedMatch(matches, now);

  if (featured && getTipPhase(featured, now) === "locked") {
    featured = await syncOfficialResult(featured, now);
    if (featured.homeScore != null && featured.awayScore != null) {
      stored.set(featured.id, {
        homeScore: featured.homeScore,
        awayScore: featured.awayScore,
      });
      matches = overlayTipMatches(getTippspielMatches(catalog), stored);
    }
  }

  return {
    matches,
    featured: getTippspielFeaturedMatch(matches, now),
    lastFinished: getLastFinishedTipMatch(matches),
  };
}

function resultFromMatch(match: Match): { homeScore: number; awayScore: number } | null {
  if (match.status !== "finished") return null;
  if (match.homeScore == null || match.awayScore == null) return null;
  return { homeScore: match.homeScore, awayScore: match.awayScore };
}

export async function syncOfficialResult(
  match: Match,
  now = Date.now(),
  overlay?: HbfOverlayMatch,
): Promise<Match> {
  if (getTipPhase(match, now) === "scored") return match;
  if (!isTipLocked(match, now)) return match;
  if (!match.fmpMatchId || !isDatabaseConfigured()) return match;

  const check = await getResultCheck(match.id);
  if (check?.hasResult) {
    const stored = await getStoredMatchResults();
    const result = stored.get(match.id);
    return result ? applyOfficialResult(match, result) : match;
  }
  if (check && now - check.checkedAt < RECHECK_AFTER_MS) return match;

  const endstand = officialEndstand(overlay) ?? resultFromMatch(match);
  if (!endstand) {
    await markResultChecked(match.id);
    return match;
  }

  await saveOfficialResult(match.id, endstand.homeScore, endstand.awayScore);
  return applyOfficialResult(match, endstand);
}

export async function pollOfficialResults(
  now = Date.now(),
  overlay: HbfOverlayMatch[] = [],
): Promise<{
  skipped?: string;
  checked: number;
  scored: Array<{ matchId: string; homeScore: number; awayScore: number }>;
}> {
  if (!isDatabaseConfigured()) {
    return { skipped: "no-db", checked: 0, scored: [] };
  }

  const stored = await getStoredMatchResults();
  const catalog = await getLiveMatches();
  const byFmp = new Map(overlay.map((match) => [match.fmpMatchId, match]));
  const matches = overlayTipMatches(getTippspielMatches(catalog), stored);
  const candidates = matches.filter((match) => {
    if (getTipPhase(match, now) === "scored") return false;
    if (!isTipLocked(match, now)) return false;
    return Boolean(match.fmpMatchId);
  });

  const scored: Array<{ matchId: string; homeScore: number; awayScore: number }> = [];
  for (const match of candidates) {
    const next = await syncOfficialResult(
      match,
      now,
      match.fmpMatchId ? byFmp.get(match.fmpMatchId) : undefined,
    );
    if (
      next.homeScore != null &&
      next.awayScore != null &&
      getTipPhase(next, now) === "scored"
    ) {
      scored.push({
        matchId: next.id,
        homeScore: next.homeScore,
        awayScore: next.awayScore,
      });
    }
  }

  return { checked: candidates.length, scored };
}
