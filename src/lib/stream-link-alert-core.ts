/** Alert once a Pflichtspiel is inside this window and still has no stream. */
export const STREAM_ALERT_WINDOW_MS = 48 * 60 * 60 * 1000;

export type StreamAlertMatch = {
  id: string;
  competitionKind: "liga" | "pokal" | "turnier";
  competitionLabel: string;
  startsAt: string;
  status: "scheduled" | "live" | "finished";
  streamUrl?: string | null;
  home: { short: string };
  away: { short: string };
};

export type StreamAlertCandidate = {
  id: string;
  label: string;
  startsAt: string;
  competitionLabel: string;
  hoursUntilKickoff: number;
};

function isPflichtspiel(match: StreamAlertMatch): boolean {
  return match.competitionKind === "liga" || match.competitionKind === "pokal";
}

function hasStream(match: StreamAlertMatch): boolean {
  return Boolean(match.streamUrl?.trim());
}

function matchLabel(match: StreamAlertMatch): string {
  return `${match.home.short} vs ${match.away.short}`;
}

/** Upcoming Liga/Pokal without stream, kickoff within the next 48 hours. */
export function findMissingStreamAlerts(
  matches: StreamAlertMatch[],
  now = Date.now(),
  windowMs = STREAM_ALERT_WINDOW_MS,
): StreamAlertCandidate[] {
  return matches
    .filter((match) => {
      if (!isPflichtspiel(match)) return false;
      if (match.status === "finished") return false;
      if (hasStream(match)) return false;
      const kickoff = Date.parse(match.startsAt);
      if (!Number.isFinite(kickoff)) return false;
      const delta = kickoff - now;
      return delta > 0 && delta <= windowMs;
    })
    .map((match) => {
      const kickoff = Date.parse(match.startsAt);
      return {
        id: match.id,
        label: matchLabel(match),
        startsAt: match.startsAt,
        competitionLabel: match.competitionLabel,
        hoursUntilKickoff: Math.round(((kickoff - now) / 3_600_000) * 10) / 10,
      };
    })
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}
