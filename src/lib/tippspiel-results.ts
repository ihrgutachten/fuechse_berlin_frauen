import type { Match } from "@/lib/data";
import { isDatabaseConfigured } from "@/lib/db";
import { fetchOfficialEndstand } from "@/lib/fmp";
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

/** Press reports do not exist during the match. Scoring still waits for Endstand, not this clock. */
const REPORT_READY_AFTER_MS = 70 * 60 * 1000;
const RECHECK_AFTER_MS = 2 * 60 * 1000;

export type HydratedTippspiel = {
  matches: Match[];
  featured: Match | undefined;
  lastFinished: Match | undefined;
};

export async function hydrateTippspiel(now = Date.now()): Promise<HydratedTippspiel> {
  const stored = isDatabaseConfigured() ? await getStoredMatchResults() : new Map();
  let matches = overlayTipMatches(getTippspielMatches(), stored);
  let featured = getTippspielFeaturedMatch(matches, now);

  if (featured && getTipPhase(featured, now) === "locked") {
    featured = await syncOfficialResult(featured, now);
    if (featured.homeScore != null && featured.awayScore != null) {
      stored.set(featured.id, {
        homeScore: featured.homeScore,
        awayScore: featured.awayScore,
      });
      matches = overlayTipMatches(getTippspielMatches(), stored);
    }
  }

  return {
    matches,
    featured: getTippspielFeaturedMatch(matches, now),
    lastFinished: getLastFinishedTipMatch(matches),
  };
}

export async function syncOfficialResult(match: Match, now = Date.now()): Promise<Match> {
  if (getTipPhase(match, now) === "scored") return match;
  if (!isTipLocked(match, now)) return match;
  if (!match.fmpMatchId || !isDatabaseConfigured()) return match;
  if (now < Date.parse(match.startsAt) + REPORT_READY_AFTER_MS) return match;

  const check = await getResultCheck(match.id);
  if (check?.hasResult) {
    const stored = await getStoredMatchResults();
    const result = stored.get(match.id);
    return result ? applyOfficialResult(match, result) : match;
  }
  if (check && now - check.checkedAt < RECHECK_AFTER_MS) return match;

  await markResultChecked(match.id);
  const endstand = await fetchOfficialEndstand(match.fmpMatchId);
  if (!endstand) return match;

  await saveOfficialResult(match.id, endstand.homeScore, endstand.awayScore);
  return applyOfficialResult(match, endstand);
}
