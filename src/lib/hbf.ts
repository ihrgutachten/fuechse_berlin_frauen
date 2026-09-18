import type { StandingRecord } from "@/lib/standings-sync";
import type { MatchReport, RosterLookup } from "@/lib/parse-press-report";

export const HBF_BASE = "https://hbfdata.fmp.sportradar.com";
export const HBF_PHASE_LIGA = 19911;
export const HBF_PHASE_POKAL = 19944;
export const FUECHSE_HBF_TEAM_ID = 201;

export const HBF_TEAM_SLUG: Record<number, string> = {
  201: "fuechse-berlin",
  930: "hl-buchholz-rosengarten",
  3645: "bergischer-hc",
  2810: "rostocker-hc",
  177: "vfl-waiblingen",
  204: "sg-nuertingen-zizishausen",
  156: "bayer-leverkusen",
  189: "mainz-05",
  795: "hsv-solingen-graefrath",
  3098: "esv-regensburg",
  174: "tus-lintfort",
  195: "werder-bremen",
  180: "hc-roedertal",
  198: "sg-kirchhof",
  3940: "sv-todesfelde",
  774: "hsg-freiburg",
  132: "tus-metzingen",
  144: "hsg-bensheim-auerbach",
};

export const HBF_LIGA_TEAM_IDS = [
  201, 930, 3645, 2810, 177, 204, 156, 189, 795, 3098, 174, 195, 180, 198, 3940, 774,
] as const;

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: "Torhüterin",
  left_winger: "Linksaußen",
  right_winger: "Rechtsaußen",
  left_back: "Rückraum links",
  right_back: "Rückraum rechts",
  centre_back: "Rückraum Mitte",
  pivot: "Kreis",
};

const OFFICIAL_ROLE: Record<string, string> = {
  official_a: "OA",
  official_b: "OB",
  official_c: "OC",
  official_d: "OD",
  official_e: "OE",
  oa: "OA",
  ob: "OB",
  oc: "OC",
  od: "OD",
  oe: "OE",
};

export type HbfMatchStatus = "scheduled" | "live" | "finished";

export type HbfOverlayMatch = {
  fmpMatchId: string;
  phaseId: number;
  startsAt: string;
  status: HbfMatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  homeTeamId: number;
  awayTeamId: number;
  homeName: string;
  awayName: string;
  venue: string | null;
  city: string | null;
  venueAddress: string | null;
  livestreamlink: string | null;
  ticketShop: string | null;
  pressReport: string | null;
  matchday: number | null;
  round: string | null;
  homeHalftime: number | null;
  awayHalftime: number | null;
  attendance: number | null;
};

export type HbfSnapshot = {
  matches: HbfOverlayMatch[];
  fetchedAt: string;
  source: string;
};

type FeedTeam = {
  id?: number;
  name?: string;
};

type FeedResults = {
  finish?: { home?: number; away?: number };
  live?: { home?: number; away?: number };
  "1st_half_time"?: { home?: number; away?: number };
};

type FeedMatch = {
  id?: number;
  start?: string;
  status?: string;
  pressReport?: string | null;
  attendance?: string | number | null;
  livestreamlink?: string;
  ticketShop?: string;
  ticketlink?: string;
  phase?: { id?: number };
  round?: { name?: string; number?: number };
  teams?: { home?: FeedTeam; away?: FeedTeam };
  results?: FeedResults | null;
  venue?: {
    name?: string;
    contact?: { address?: { street?: string; zip?: string; city?: string } };
  };
};

type FeedPage = {
  meta?: { offset?: number; limit?: number; count?: number };
  data?: FeedMatch[];
};

type DetailPlayer = {
  id?: number;
  number?: number | null;
  position?: string;
  firstName?: string;
  lastName?: string;
};

type DetailEvent = {
  type?: string;
  player1?: { id?: number; number?: number; firstName?: string; lastName?: string };
  team?: { id?: number };
};

type DetailPayload = FeedMatch & {
  attendance?: string;
  teams?: {
    home?: FeedTeam & { players?: DetailPlayer[]; officials?: Array<{ position?: string; firstName?: string; lastName?: string }> };
    away?: FeedTeam & { players?: DetailPlayer[]; officials?: Array<{ position?: string; firstName?: string; lastName?: string }> };
  };
  events?: DetailEvent[];
};

function asNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function nonempty(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function slugifyTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function teamSlug(id: number, name: string): string {
  return HBF_TEAM_SLUG[id] ?? slugifyTeamName(name);
}

export function involvesFuechse(match: HbfOverlayMatch): boolean {
  return match.homeTeamId === FUECHSE_HBF_TEAM_ID || match.awayTeamId === FUECHSE_HBF_TEAM_ID;
}

function venueAddress(match: FeedMatch): string | null {
  const address = match.venue?.contact?.address;
  if (!address) return null;
  const street = nonempty(address.street);
  const zip = nonempty(address.zip);
  const city = nonempty(address.city);
  const line = [street, [zip, city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return nonempty(line);
}

function mapRound(phaseId: number, round?: FeedMatch["round"]): string | null {
  if (!round) return null;
  if (phaseId === HBF_PHASE_POKAL) {
    if (round.number === 1) return "1. Runde";
    const name = nonempty(round.name)?.replace(/\s+DHB-Pokal Frauen.*$/i, "").trim();
    return name || nonempty(round.name);
  }
  return nonempty(round.name);
}

function mapStatus(raw: string | undefined, results: FeedResults | null | undefined, startsAt: string): HbfMatchStatus {
  if (raw === "confirmed_result") return "finished";
  if (results?.finish && asNumber(results.finish.home) != null && asNumber(results.finish.away) != null) {
    return "finished";
  }
  if (raw === "live" || raw === "running" || raw === "in_progress") return "live";
  if (Date.now() >= Date.parse(startsAt) && !results?.finish) return "live";
  return "scheduled";
}

function scores(results: FeedResults | null | undefined): { homeScore: number | null; awayScore: number | null } {
  const finishHome = asNumber(results?.finish?.home);
  const finishAway = asNumber(results?.finish?.away);
  if (finishHome != null && finishAway != null) return { homeScore: finishHome, awayScore: finishAway };
  const liveHome = asNumber(results?.live?.home);
  const liveAway = asNumber(results?.live?.away);
  if (liveHome != null && liveAway != null) return { homeScore: liveHome, awayScore: liveAway };
  return { homeScore: null, awayScore: null };
}

export function compactHbfMatch(raw: FeedMatch): HbfOverlayMatch | null {
  const id = asNumber(raw.id);
  const homeId = asNumber(raw.teams?.home?.id);
  const awayId = asNumber(raw.teams?.away?.id);
  const startsAt = nonempty(raw.start);
  if (id == null || homeId == null || awayId == null || !startsAt) return null;
  const phaseId = asNumber(raw.phase?.id) ?? 0;
  const { homeScore, awayScore } = scores(raw.results);
  return {
    fmpMatchId: String(id),
    phaseId,
    startsAt,
    status: mapStatus(raw.status, raw.results, startsAt),
    homeScore,
    awayScore,
    homeHalftime: asNumber(raw.results?.["1st_half_time"]?.home),
    awayHalftime: asNumber(raw.results?.["1st_half_time"]?.away),
    attendance: asNumber(raw.attendance),
    homeTeamId: homeId,
    awayTeamId: awayId,
    homeName: raw.teams?.home?.name?.trim() || `Team ${homeId}`,
    awayName: raw.teams?.away?.name?.trim() || `Team ${awayId}`,
    venue: nonempty(raw.venue?.name),
    city: nonempty(raw.venue?.contact?.address?.city),
    venueAddress: venueAddress(raw),
    livestreamlink: nonempty(raw.livestreamlink),
    ticketShop: nonempty(raw.ticketShop) ?? nonempty(raw.ticketlink),
    pressReport: nonempty(raw.pressReport),
    matchday: phaseId === HBF_PHASE_LIGA ? asNumber(raw.round?.number) : null,
    round: mapRound(phaseId, raw.round),
  };
}

async function fetchJson(url: string, options: { noStore?: boolean; revalidate?: number } = {}) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; FuechseBerlinFrauen/1.0; +https://fuechse-berlin-frauen.de)",
    },
    ...(options.noStore
      ? { cache: "no-store" as const }
      : { next: { revalidate: options.revalidate ?? 180 } }),
  });
  if (!res.ok) throw new Error(`[hbf] ${url} ${res.status}`);
  return res.json();
}

export async function fetchPhaseMatches(
  phaseId: number,
  options: { noStore?: boolean } = {},
): Promise<HbfOverlayMatch[]> {
  const limit = 50;
  const firstUrl = `${HBF_BASE}/feeds/matches?phaseId=${phaseId}&limit=${limit}&offset=0`;
  const first = (await fetchJson(firstUrl, options)) as FeedPage;
  const count = first.meta?.count ?? first.data?.length ?? 0;
  const pages = [first];
  const rest: Array<Promise<FeedPage>> = [];
  for (let offset = limit; offset < count; offset += limit) {
    rest.push(
      fetchJson(`${HBF_BASE}/feeds/matches?phaseId=${phaseId}&limit=${limit}&offset=${offset}`, options) as Promise<FeedPage>,
    );
  }
  pages.push(...(await Promise.all(rest)));
  const matches: HbfOverlayMatch[] = [];
  for (const page of pages) {
    for (const row of page.data ?? []) {
      const compact = compactHbfMatch(row);
      if (compact) matches.push(compact);
    }
  }
  return matches;
}

export async function fetchHbfSnapshot(options: { noStore?: boolean } = {}): Promise<HbfSnapshot> {
  const [liga, pokal] = await Promise.all([
    fetchPhaseMatches(HBF_PHASE_LIGA, options),
    fetchPhaseMatches(HBF_PHASE_POKAL, options),
  ]);
  return {
    matches: [...liga, ...pokal],
    fetchedAt: new Date().toISOString(),
    source: "hbf",
  };
}

export function computeStandings(matches: HbfOverlayMatch[]): StandingRecord[] {
  const table = new Map<
    string,
    { played: number; won: number; draw: number; lost: number; goalsFor: number; goalsAgainst: number; points: number }
  >();
  for (const teamId of HBF_LIGA_TEAM_IDS) {
    table.set(HBF_TEAM_SLUG[teamId], {
      played: 0,
      won: 0,
      draw: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (match.phaseId !== HBF_PHASE_LIGA) continue;
    if (match.status !== "finished") continue;
    if (match.homeScore == null || match.awayScore == null) continue;
    const homeSlug = teamSlug(match.homeTeamId, match.homeName);
    const awaySlug = teamSlug(match.awayTeamId, match.awayName);
    const home = table.get(homeSlug);
    const away = table.get(awaySlug);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won += 1;
      home.points += 2;
      away.lost += 1;
    } else if (match.homeScore < match.awayScore) {
      away.won += 1;
      away.points += 2;
      home.lost += 1;
    } else {
      home.draw += 1;
      away.draw += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const sorted = [...table.entries()].sort((a, b) => {
    if (b[1].points !== a[1].points) return b[1].points - a[1].points;
    const diffA = a[1].goalsFor - a[1].goalsAgainst;
    const diffB = b[1].goalsFor - b[1].goalsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    if (b[1].goalsFor !== a[1].goalsFor) return b[1].goalsFor - a[1].goalsFor;
    return a[0].localeCompare(b[0], "de");
  });

  const rows: StandingRecord[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (
      j + 1 < sorted.length &&
      sorted[j + 1][1].points === sorted[i][1].points &&
      sorted[j + 1][1].goalsFor - sorted[j + 1][1].goalsAgainst ===
        sorted[i][1].goalsFor - sorted[i][1].goalsAgainst &&
      sorted[j + 1][1].goalsFor === sorted[i][1].goalsFor
    ) {
      j += 1;
    }
    const rank = i + 1;
    for (let k = i; k <= j; k++) {
      const [teamSlugKey, stats] = sorted[k];
      rows.push({ rank, teamSlug: teamSlugKey, ...stats });
    }
    i = j + 1;
  }
  return rows;
}

export function officialEndstand(match: HbfOverlayMatch | undefined): { homeScore: number; awayScore: number } | null {
  if (!match || match.status !== "finished") return null;
  if (match.homeScore == null || match.awayScore == null) return null;
  return { homeScore: match.homeScore, awayScore: match.awayScore };
}

function playerName(first?: string, last?: string): string {
  return `${first ?? ""} ${last ?? ""}`.replace(/\s+/g, " ").trim();
}

export function parseMatchDetailsReport(payload: unknown, roster: RosterLookup[] = []): MatchReport | null {
  const data = payload as DetailPayload;
  const homePlayers = data.teams?.home?.players;
  const awayPlayers = data.teams?.away?.players;
  if (!Array.isArray(homePlayers) || !Array.isArray(awayPlayers) || homePlayers.length < 2) return null;

  const homeId = asNumber(data.teams?.home?.id);
  const stats = new Map<number, Map<number, { goals: number; sevenMeterMade: number; sevenMeterAttempts: number; twoMinutes: number; warnings: number }>>();
  const ensure = (teamId: number, number: number) => {
    if (!stats.has(teamId)) stats.set(teamId, new Map());
    const team = stats.get(teamId)!;
    if (!team.has(number)) {
      team.set(number, { goals: 0, sevenMeterMade: 0, sevenMeterAttempts: 0, twoMinutes: 0, warnings: 0 });
    }
    return team.get(number)!;
  };

  for (const event of data.events ?? []) {
    const teamId = asNumber(event.team?.id);
    const number = asNumber(event.player1?.number);
    if (teamId == null || number == null) continue;
    const row = ensure(teamId, number);
    const type = event.type ?? "";
    if (type === "goal") row.goals += 1;
    if (type === "7_meter_goal") {
      row.goals += 1;
      row.sevenMeterMade += 1;
      row.sevenMeterAttempts += 1;
    }
    if (type === "7_meter_missed") row.sevenMeterAttempts += 1;
    if (type === "2_minute_penalty") row.twoMinutes += 1;
    if (type === "warning" || type === "yellow_card") row.warnings += 1;
  }

  const toTeam = (
    name: string,
    teamId: number | null,
    players: DetailPlayer[],
    officials: Array<{ position?: string; firstName?: string; lastName?: string }> | undefined,
    isUs: boolean,
  ) => {
    const teamStats = teamId != null ? stats.get(teamId) : undefined;
    return {
      name,
      isUs,
      players: players
        .filter((player) => asNumber(player.number) != null)
        .map((player) => {
          const number = asNumber(player.number)!;
          const row = teamStats?.get(number) ?? {
            goals: 0,
            sevenMeterMade: 0,
            sevenMeterAttempts: 0,
            twoMinutes: 0,
            warnings: 0,
          };
          const nameFromFeed = playerName(player.firstName, player.lastName);
          const match = isUs
            ? roster.find((member) => member.role === "spielerin" && member.number === number)
            : undefined;
          return {
            number,
            name: match?.name ?? nameFromFeed,
            goals: row.goals,
            sevenMeterMade: row.sevenMeterMade,
            sevenMeterAttempts: row.sevenMeterAttempts,
            twoMinutes: row.twoMinutes,
            warnings: row.warnings,
            slug: match?.slug ?? null,
            photo: match?.photo ?? null,
            positionLabel: match?.positionLabel ?? POSITION_LABEL[player.position ?? ""] ?? null,
          };
        }),
      officials: (officials ?? []).map((official) => ({
        role: OFFICIAL_ROLE[official.position?.toLowerCase() ?? ""] ?? official.position?.toUpperCase() ?? "O",
        name: playerName(official.firstName, official.lastName),
      })),
    };
  };

  const homeName = data.teams?.home?.name?.trim() || "Heim";
  const awayName = data.teams?.away?.name?.trim() || "Gast";
  const homeIsUs = homeId === FUECHSE_HBF_TEAM_ID;
  const home = toTeam(homeName, homeId, homePlayers, data.teams?.home?.officials, homeIsUs);
  const away = toTeam(awayName, asNumber(data.teams?.away?.id), awayPlayers, data.teams?.away?.officials, !homeIsUs);
  const { homeScore, awayScore } = scores(data.results);
  const attendance = asNumber(data.attendance);

  return {
    attendance,
    homeScore,
    awayScore,
    homeHalftime: asNumber(data.results?.["1st_half_time"]?.home),
    awayHalftime: asNumber(data.results?.["1st_half_time"]?.away),
    home,
    away,
    ourTeam: home.isUs ? home : away,
    opponent: home.isUs ? away : home,
  };
}

export async function fetchMatchDetailsReport(
  fmpMatchId: string,
  roster: RosterLookup[],
  revalidateSeconds = 1800,
): Promise<MatchReport | null> {
  try {
    const payload = await fetchJson(`${HBF_BASE}/feeds/match-details/${fmpMatchId}`, {
      revalidate: revalidateSeconds,
    });
    return parseMatchDetailsReport(payload, roster);
  } catch (err) {
    console.error("[hbf] match-details", err instanceof Error ? err.message : err);
    return null;
  }
}

export function pressReportPdfUrl(fmpMatchId: string): string {
  return `${HBF_BASE}/match/${fmpMatchId}/pressReport.pdf`;
}
