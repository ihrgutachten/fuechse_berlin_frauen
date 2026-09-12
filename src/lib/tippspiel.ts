import {
  getMatches,
  pickNextMatch,
  type Match,
} from "@/lib/data";

export const TIPPSPIEL_MAX_GOALS = 60;
export const POINTS_EXACT = 5;
export const POINTS_DIFF = 3;
export const POINTS_WINNER = 1;

export type TipPhase = "open" | "locked" | "scored";

export type ScoredPrediction = {
  points: number;
  exact: boolean;
  diff: boolean;
  winner: boolean;
};

function isPflichtspiel(match: Match): boolean {
  return match.competitionKind === "liga" || match.competitionKind === "pokal";
}

export function getTippspielMatches(): Match[] {
  return getMatches().filter(isPflichtspiel);
}

export function isTipLocked(match: Match, now = Date.now()): boolean {
  if (match.status !== "scheduled") return true;
  return now >= Date.parse(match.startsAt);
}

export function hasResult(match: Match): boolean {
  return match.homeScore != null && match.awayScore != null;
}

export function getTipPhase(match: Match, now = Date.now()): TipPhase {
  if (hasResult(match) && (match.status === "finished" || isTipLocked(match, now))) {
    return "scored";
  }
  if (isTipLocked(match, now)) return "locked";
  return "open";
}

export function applyOfficialResult(
  match: Match,
  result: { homeScore: number; awayScore: number },
): Match {
  return {
    ...match,
    homeScore: result.homeScore,
    awayScore: result.awayScore,
    status: "finished",
  };
}

export function overlayTipMatches(
  matches: Match[],
  results: Map<string, { homeScore: number; awayScore: number }>,
): Match[] {
  return matches.map((match) => {
    const result = results.get(match.id);
    return result ? applyOfficialResult(match, result) : match;
  });
}

/** Live, currently locked (kickoff done, no official score yet), next scheduled, else last scored. */
export function getTippspielFeaturedMatch(
  matches = getTippspielMatches(),
  now = Date.now(),
): Match | undefined {
  const live = matches.find((match) => match.status === "live");
  if (live) return live;
  const inPlay = matches
    .filter((match) => isTipLocked(match, now) && getTipPhase(match, now) !== "scored")
    .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt))[0];
  if (inPlay) return inPlay;
  const next = pickNextMatch(matches, now);
  if (next) return next;
  return getLastFinishedTipMatch(matches);
}

export function getLastFinishedTipMatch(matches = getTippspielMatches()): Match | undefined {
  return getFinishedTipMatches(matches).at(-1);
}

export function getFinishedTipMatches(matches = getTippspielMatches()): Match[] {
  return matches
    .filter((match) => getTipPhase(match) === "scored")
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
}

/** Next home Pflichtspiel after this kickoff. Weekly ticket prize points there. */
export function getNextHomeMatchAfter(
  startsAt: string,
  matches = getTippspielMatches(),
): Match | undefined {
  const after = Date.parse(startsAt);
  return matches
    .filter((match) => match.isHome && Date.parse(match.startsAt) > after)
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))[0];
}

export function predictionPoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
): ScoredPrediction {
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return { points: POINTS_EXACT, exact: true, diff: true, winner: true };
  }

  const predDiff = predictedHome - predictedAway;
  const actualDiff = actualHome - actualAway;
  const predWinner = Math.sign(predDiff);
  const actualWinner = Math.sign(actualDiff);
  const winner = predWinner === actualWinner;

  if (winner && predDiff === actualDiff) {
    return { points: POINTS_DIFF, exact: false, diff: true, winner: true };
  }
  if (winner) {
    return { points: POINTS_WINNER, exact: false, diff: false, winner: true };
  }
  return { points: 0, exact: false, diff: false, winner: false };
}

export function parseScore(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!/^\d{1,2}$/.test(raw)) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > TIPPSPIEL_MAX_GOALS) return null;
  return n;
}

const NICKNAME_RE = /^[a-zA-Z0-9äöüÄÖÜß._-]{3,20}$/;

/** HTML `pattern` (ohne Anker). Muss zu NICKNAME_RE passen. */
export const NICKNAME_PATTERN = "[A-Za-z0-9äöüÄÖÜß._\\-]{3,20}";
export const NICKNAME_HINT =
  "Ein Wort ohne Leerzeichen, 3-20 Zeichen. Erlaubt sind Buchstaben, Zahlen, Punkt, Unterstrich und Bindestrich. Beispiel: RevierFuchs";
export const NICKNAME_ERROR =
  "Bitte ein Wort ohne Leerzeichen. 3-20 Zeichen: Buchstaben, Zahlen, Punkt, Unterstrich oder Bindestrich.";

export function normalizeNickname(raw: string): string | null {
  const nickname = raw.trim().replace(/\s+/g, " ");
  if (!NICKNAME_RE.test(nickname)) return null;
  return nickname;
}

export function nicknameKey(nickname: string): string {
  return nickname.trim().toLocaleLowerCase("de-DE");
}
