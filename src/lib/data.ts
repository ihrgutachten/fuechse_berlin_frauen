import clubs from "@/data/clubs.json";
import matches from "@/data/matches.json";
import standings from "@/data/standings.json";
import news from "@/data/news.json";
import players from "@/data/players.json";
import sponsors from "@/data/sponsors.json";
import { allSponsorProfiles } from "@/data/sponsor-profile-list";
import playerStatsFallback from "@/data/player-stats.json";
import { formatScenarioDay, formatScenarioTime, isSameBerlinDay } from "@/lib/format";
import { TICKET_SHOP_URL } from "@/lib/tickets";
import {
  computeStandings,
  HBF_PHASE_LIGA,
  HBF_PHASE_POKAL,
  involvesFuechse,
  teamSlug,
  type HbfOverlayMatch,
} from "@/lib/hbf";
import { getHbfOverlayMatches } from "@/lib/hbf-sync";
import type { ScenarioFixture, ScenarioTeamCard } from "@/lib/scenario";
import { getStoredStandings, type StandingRecord } from "@/lib/standings-sync";
import {
  getPlayerStatsSnapshot,
  hydrateTopPlayers,
  type HydratedTopPlayer,
  type PlayerStatsSnapshot,
} from "@/lib/player-stats-sync";

export type CompetitionKind = "liga" | "pokal" | "turnier";

export type Club = {
  slug: string;
  name: string;
  short: string;
  city: string;
  venue?: string;
  venueAddress?: string;
  website?: string;
  isUs: boolean;
  hasLogo: boolean;
  logo: string;
};

export type TeamSide = {
  slug: string;
  name: string;
  short: string;
  isUs: boolean;
  hasLogo: boolean;
  logo: string;
};

type MatchRecord = {
  id: string;
  competitionKind: CompetitionKind;
  competitionLabel: string;
  matchday?: number | null;
  round?: string | null;
  homeSlug: string;
  awaySlug: string;
  homeName?: string;
  awayName?: string;
  startsAt: string;
  streamUrl?: string | null;
  ticketUrl?: string | null;
  homeScore?: number;
  awayScore?: number;
  homeHalftime?: number;
  awayHalftime?: number;
  attendance?: number;
  status: "scheduled" | "live" | "finished";
  venue?: string;
  city?: string;
  venueAddress?: string;
  mapsUrl?: string | null;
  fmpMatchId?: string | null;
};

export type Match = {
  id: string;
  competitionKind: CompetitionKind;
  competitionLabel: string;
  matchday: number | null;
  round: string | null;
  home: TeamSide;
  away: TeamSide;
  startsAt: string;
  venue: string;
  city: string;
  venueAddress: string | null;
  mapsUrl: string | null;
  isHome: boolean;
  streamUrl?: string | null;
  ticketUrl?: string | null;
  homeScore?: number;
  awayScore?: number;
  homeHalftime?: number;
  awayHalftime?: number;
  attendance?: number;
  status: "scheduled" | "live" | "finished";
  fmpMatchId: string | null;
};

function mapsDirUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export type StandingRow = {
  rank: number;
  teamSlug: string;
  team: string;
  short: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  isUs: boolean;
  hasLogo: boolean;
  logo: string;
};

export type NewsItem = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  coverLabel: string;
  cover?: string;
  coverCredit?: string;
  body: string[];
};

export type TeamRole = "spielerin" | "coach" | "staff";

export type Player = {
  slug: string;
  name: string;
  number: number | null;
  role: TeamRole;
  position: string;
  positionLabel: string;
  nickname?: string;
  birthPlace?: string;
  joined?: string;
  height?: string;
  previousClubs?: string;
  patron?: string;
  patronUrl?: string;
  photo: string;
  nationality?: string;
  bio?: string;
  /** Optional recorded pronunciation (preferred). */
  nameAudio?: string;
  /** BCP-47 lang for TTS fallback, e.g. nl-NL */
  nameLang?: string;
  /** Phonetic spelling for better TTS */
  namePhonetic?: string;
};

export type SponsorTier =
  | "platin"
  | "gold"
  | "silber"
  | "premium"
  | "partner"
  | "ausruestung"
  | "gesundheit"
  | "mobil"
  | "medien"
  | "versicherung"
  | "hbf";

export type Sponsor = {
  id: string;
  name: string;
  tier: SponsorTier;
  tierLabel: string;
  url: string;
  logo: string;
  /** Internal portrait page slug, e.g. sponsor-ortho-ped */
  profileSlug?: string;
};

export type SponsorProfileSection = {
  title: string;
  body: string;
};

export type SponsorProfileLocation = {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
};

export type SponsorProfileImage = {
  src: string;
  alt: string;
};

export type SponsorProfile = {
  slug: string;
  sponsorId: string;
  headline: string;
  tagline: string;
  intro: string;
  sections: SponsorProfileSection[];
  images: SponsorProfileImage[];
  services: string[];
  locations: SponsorProfileLocation[];
  website: string;
  sourceNote?: string;
};

export const sponsorTierOrder: SponsorTier[] = [
  "platin",
  "gold",
  "silber",
  "premium",
  "partner",
  "ausruestung",
  "gesundheit",
  "mobil",
  "medien",
  "versicherung",
  "hbf",
];

export const homepageSponsorTiers: SponsorTier[] = [
  "platin",
  "gold",
  "silber",
  "premium",
];

const clubList = clubs as Club[];

export const competitionLabels: Record<CompetitionKind, string> = {
  liga: "Liga",
  pokal: "Pokal",
  turnier: "Turniere",
};

export function getClubs(): Club[] {
  return clubList;
}

export function getClubBySlug(slug: string): Club | undefined {
  return clubList.find((c) => c.slug === slug);
}

function toTeamSide(club: Club): TeamSide {
  return {
    slug: club.slug,
    name: club.name,
    short: club.short,
    isUs: club.isUs,
    hasLogo: club.hasLogo,
    logo: club.logo,
  };
}

function fallbackClub(slug: string, name: string, isUs: boolean): Club {
  return {
    slug,
    name,
    short: name,
    city: "",
    isUs,
    hasLogo: false,
    logo: `/clubs/${slug}.png`,
  };
}

function resolveClub(slug: string, name: string, isUs: boolean): Club {
  return getClubBySlug(slug) ?? fallbackClub(slug, name, isUs);
}

function currentStatus(overlay: HbfOverlayMatch): HbfOverlayMatch["status"] {
  if (overlay.status === "finished") return "finished";
  if (overlay.status === "live") return "live";
  if (Date.now() >= Date.parse(overlay.startsAt)) return "live";
  return "scheduled";
}

function overlayRecord(record: MatchRecord, overlay: HbfOverlayMatch): MatchRecord {
  return {
    ...record,
    startsAt: overlay.startsAt,
    status: currentStatus(overlay),
    homeScore: overlay.homeScore ?? record.homeScore,
    awayScore: overlay.awayScore ?? record.awayScore,
    homeHalftime: overlay.homeHalftime ?? record.homeHalftime,
    awayHalftime: overlay.awayHalftime ?? record.awayHalftime,
    attendance: overlay.attendance ?? record.attendance,
    venue: overlay.venue ?? record.venue,
    city: overlay.city ?? record.city,
    venueAddress: overlay.venueAddress ?? record.venueAddress,
    streamUrl: overlay.livestreamlink ?? record.streamUrl,
    ticketUrl: overlay.ticketShop ?? record.ticketUrl,
    matchday: overlay.matchday ?? record.matchday,
    round: overlay.round ?? record.round,
    homeName: overlay.homeName,
    awayName: overlay.awayName,
  };
}

function recordFromOverlay(overlay: HbfOverlayMatch): MatchRecord {
  const kind: CompetitionKind = overlay.phaseId === HBF_PHASE_POKAL ? "pokal" : "liga";
  return {
    id: `hbf-${overlay.fmpMatchId}`,
    competitionKind: kind,
    competitionLabel: kind === "pokal" ? "DHB-Pokal Frauen" : "2. Bundesliga Frauen",
    matchday: overlay.matchday,
    round: overlay.round,
    homeSlug: teamSlug(overlay.homeTeamId, overlay.homeName),
    awaySlug: teamSlug(overlay.awayTeamId, overlay.awayName),
    homeName: overlay.homeName,
    awayName: overlay.awayName,
    startsAt: overlay.startsAt,
    status: currentStatus(overlay),
    homeScore: overlay.homeScore ?? undefined,
    awayScore: overlay.awayScore ?? undefined,
    homeHalftime: overlay.homeHalftime ?? undefined,
    awayHalftime: overlay.awayHalftime ?? undefined,
    attendance: overlay.attendance ?? undefined,
    venue: overlay.venue ?? undefined,
    city: overlay.city ?? undefined,
    venueAddress: overlay.venueAddress ?? undefined,
    streamUrl: overlay.livestreamlink,
    ticketUrl: overlay.ticketShop,
    fmpMatchId: overlay.fmpMatchId,
  };
}

function mergeMatchRecords(overlay: HbfOverlayMatch[]): MatchRecord[] {
  const byFmp = new Map(overlay.map((match) => [match.fmpMatchId, match]));
  const used = new Set<string>();
  const merged = (matches as MatchRecord[]).map((record) => {
    const fmpId = record.fmpMatchId ?? "";
    const live = fmpId ? byFmp.get(fmpId) : undefined;
    if (live) used.add(live.fmpMatchId);
    return live ? overlayRecord(record, live) : record;
  });
  for (const live of overlay) {
    if (used.has(live.fmpMatchId)) continue;
    if (!involvesFuechse(live)) continue;
    if (live.phaseId !== HBF_PHASE_LIGA && live.phaseId !== HBF_PHASE_POKAL) continue;
    merged.push(recordFromOverlay(live));
  }
  return merged;
}

function hydrateMatch(record: MatchRecord): Match {
  const home = resolveClub(
    record.homeSlug,
    record.homeName ?? record.homeSlug,
    record.homeSlug === "fuechse-berlin",
  );
  const away = resolveClub(
    record.awaySlug,
    record.awayName ?? record.awaySlug,
    record.awaySlug === "fuechse-berlin",
  );

  const isHome = home.isUs;
  const host = home;
  const streamUrl =
    record.streamUrl === null
      ? null
      : (record.streamUrl ??
        (record.competitionKind === "turnier"
          ? null
          : "https://www.sportdeutschland.tv"));

  const venue = record.venue ?? host.venue ?? `Spielstätte ${host.city}`;
  const city = record.city ?? host.city;
  const venueAddress = record.venueAddress ?? host.venueAddress ?? null;
  const mapsUrl =
    record.mapsUrl === null
      ? null
      : (record.mapsUrl ?? (venueAddress ? mapsDirUrl(venueAddress) : null));

  return {
    id: record.id,
    competitionKind: record.competitionKind,
    competitionLabel: record.competitionLabel,
    matchday: record.matchday ?? null,
    round: record.round ?? null,
    home: toTeamSide(home),
    away: toTeamSide(away),
    startsAt: record.startsAt,
    venue,
    city,
    venueAddress,
    mapsUrl,
    isHome,
    streamUrl,
    ticketUrl:
      record.ticketUrl === null
        ? null
        : (record.ticketUrl ?? (isHome ? TICKET_SHOP_URL : null)),
    homeScore: record.homeScore,
    awayScore: record.awayScore,
    homeHalftime: record.homeHalftime,
    awayHalftime: record.awayHalftime,
    attendance: record.attendance,
    status: record.status,
    fmpMatchId: record.fmpMatchId ?? null,
  };
}

function sortMatches(list: Match[]): Match[] {
  return [...list].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
}

function matchesFromRecords(records: MatchRecord[], kind?: CompetitionKind | "all"): Match[] {
  const list = sortMatches(records.map(hydrateMatch));
  if (!kind || kind === "all") return list;
  return list.filter((m) => m.competitionKind === kind);
}

export function getStaticMatches(kind?: CompetitionKind | "all"): Match[] {
  return matchesFromRecords(matches as MatchRecord[], kind);
}

export function getMatchById(id: string): Match | undefined {
  return getStaticMatches().find((match) => match.id === id);
}

export async function getLiveMatchById(id: string): Promise<Match | undefined> {
  return (await getLiveMatches()).find((match) => match.id === id);
}

/** Last finished or live Pflichtspiel that has an official FMP report id. */
export function getLastMatchWithReport(list?: Match[]): Match | undefined {
  return (list ?? getStaticMatches())
    .filter(
      (match) =>
        Boolean(match.fmpMatchId) &&
        (match.status === "finished" || match.status === "live"),
    )
    .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt))[0];
}

export function getMatches(kind?: CompetitionKind | "all"): Match[] {
  return getStaticMatches(kind);
}

export async function getLiveMatches(kind?: CompetitionKind | "all"): Promise<Match[]> {
  try {
    const overlay = await getHbfOverlayMatches();
    if (overlay.length === 0) return getStaticMatches(kind);
    return matchesFromRecords(mergeMatchRecords(overlay), kind);
  } catch (err) {
    console.error("[matches] overlay", err instanceof Error ? err.message : err);
    return getStaticMatches(kind);
  }
}

export type MatchEmphasis = "past" | "next" | "today" | "upcoming";

function isPflichtspiel(match: Match): boolean {
  return match.competitionKind === "liga" || match.competitionKind === "pokal";
}

/** Nächstes Pflichtspiel (Liga/Pokal); Turniere nur als Fallback. */
export function pickNextMatch(matches: Match[], now = Date.now()): Match | undefined {
  const upcoming = matches.filter(
    (m) => m.status === "scheduled" && +new Date(m.startsAt) >= now,
  );
  return (
    upcoming.find((m) => isPflichtspiel(m)) ??
    upcoming[0]
  );
}

/** Live or already started Pflichtspiel whose kickoff is still today in Berlin. */
export function pickTodaysMatch(matches: Match[], now = Date.now()): Match | undefined {
  const ofToday = matches.filter(
    (match) => isPflichtspiel(match) && isSameBerlinDay(match.startsAt, now),
  );
  const live = ofToday.find((match) => match.status === "live");
  if (live) return live;
  const finished = ofToday
    .filter((match) => match.status === "finished")
    .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt))[0];
  if (finished) return finished;
  return ofToday
    .filter((match) => +new Date(match.startsAt) <= now)
    .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt))[0];
}

/** Today’s match until midnight Berlin, otherwise the next scheduled one. */
export function pickFeaturedMatch(matches: Match[], now = Date.now()): Match | undefined {
  return pickTodaysMatch(matches, now) ?? pickNextMatch(matches, now);
}

export function getNextMatch(list?: Match[]): Match | undefined {
  return pickNextMatch(list ?? getStaticMatches());
}

export function getFeaturedMatch(list?: Match[]): Match | undefined {
  return pickFeaturedMatch(list ?? getStaticMatches());
}

export function getNextHomeMatch(list?: Match[]): Match | undefined {
  return pickNextMatch((list ?? getStaticMatches()).filter((m) => m.isHome));
}

export function getMatchEmphasis(
  match: Match,
  featuredId: string | undefined,
  now?: number,
): MatchEmphasis {
  const clock = now ?? Date.now();
  if (featuredId && match.id === featuredId) {
    if (match.status === "scheduled" && +new Date(match.startsAt) > clock) return "next";
    if (match.status === "finished" && !isSameBerlinDay(match.startsAt, clock)) return "past";
    return "today";
  }
  if (match.status === "live") return "today";
  if (match.status === "finished") return "past";
  if (+new Date(match.startsAt) < clock) return "past";
  return "upcoming";
}

export function fuechseResult(match: Match): "win" | "loss" | "draw" | null {
  if (match.homeScore == null || match.awayScore == null) return null;
  const ours = match.isHome ? match.homeScore : match.awayScore;
  const theirs = match.isHome ? match.awayScore : match.homeScore;
  if (ours > theirs) return "win";
  if (ours < theirs) return "loss";
  return "draw";
}

function hydrateStandingRows(
  rows: Array<Omit<StandingRow, "team" | "short" | "isUs" | "hasLogo" | "logo">>,
): StandingRow[] {
  return rows.map((row) => {
    const club = getClubBySlug(row.teamSlug);
    return {
      ...row,
      team: club?.name ?? row.teamSlug,
      short: club?.short ?? row.teamSlug,
      isUs: club?.isUs ?? false,
      hasLogo: club?.hasLogo ?? false,
      logo: club?.logo ?? "",
    };
  });
}

export async function getStandings(): Promise<StandingRow[]> {
  const live = await getStoredStandings();
  if (live?.length) return hydrateStandingRows(live);
  try {
    const overlay = await getHbfOverlayMatches();
    if (overlay.length) return hydrateStandingRows(computeStandings(overlay));
  } catch (err) {
    console.error("[standings] overlay", err instanceof Error ? err.message : err);
  }
  return hydrateStandingRows(standings as StandingRecord[]);
}

function toScenarioTeam(slug: string, fallbackName: string): ScenarioTeamCard {
  const club = resolveClub(slug, fallbackName, slug === "fuechse-berlin");
  return {
    slug: club.slug,
    name: club.name,
    short: club.short,
    hasLogo: club.hasLogo,
    logo: club.logo,
    isUs: club.isUs,
  };
}

export async function getScenarioInput(): Promise<{
  standings: StandingRow[];
  fixtures: ScenarioFixture[];
}> {
  const standings = await getStandings();
  let fixtures: ScenarioFixture[] = [];
  try {
    const overlay = await getHbfOverlayMatches();
    fixtures = overlay
      .filter((match) => match.phaseId === HBF_PHASE_LIGA && match.status !== "finished")
      .map((match) => ({
        id: match.fmpMatchId,
        matchday: match.matchday ?? 0,
        startsAt: match.startsAt,
        dayLabel: formatScenarioDay(match.startsAt),
        timeLabel: formatScenarioTime(match.startsAt),
        home: toScenarioTeam(teamSlug(match.homeTeamId, match.homeName), match.homeName),
        away: toScenarioTeam(teamSlug(match.awayTeamId, match.awayName), match.awayName),
      }));
  } catch (err) {
    console.error("[scenario] overlay", err instanceof Error ? err.message : err);
  }
  if (fixtures.length === 0) {
    fixtures = getStaticMatches("liga")
      .filter((match) => match.status === "scheduled")
      .map((match) => ({
        id: match.id,
        matchday: match.matchday ?? 0,
        startsAt: match.startsAt,
        dayLabel: formatScenarioDay(match.startsAt),
        timeLabel: formatScenarioTime(match.startsAt),
        home: {
          slug: match.home.slug,
          name: match.home.name,
          short: match.home.short,
          hasLogo: match.home.hasLogo,
          logo: match.home.logo,
          isUs: match.home.isUs,
        },
        away: {
          slug: match.away.slug,
          name: match.away.name,
          short: match.away.short,
          hasLogo: match.away.hasLogo,
          logo: match.away.logo,
          isUs: match.away.isUs,
        },
      }));
  }
  fixtures.sort(
    (a, b) => a.matchday - b.matchday || +new Date(a.startsAt) - +new Date(b.startsAt),
  );
  return { standings, fixtures };
}

export type TopPlayers = {
  scorers: HydratedTopPlayer[];
  keepers: HydratedTopPlayer[];
  fetchedAt: string;
  source: string;
};

export async function getTopPlayers(): Promise<TopPlayers> {
  const live = await getPlayerStatsSnapshot();
  const snapshot = (live ?? playerStatsFallback) as PlayerStatsSnapshot;
  return hydrateTopPlayers(
    snapshot,
    getTeamMembers().map((player) => ({
      slug: player.slug,
      name: player.name,
      photo: player.photo,
      positionLabel: player.positionLabel,
      role: player.role,
    })),
  );
}

export function getNews(): NewsItem[] {
  return (news as NewsItem[]).sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
}

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return getNews().find((n) => n.slug === slug);
}

export function getPlayers(): Player[] {
  return (players as Player[]).filter((p) => p.role === "spielerin");
}

export function getTeamMembers(role?: TeamRole | "all"): Player[] {
  const list = players as Player[];
  if (!role || role === "all") return list;
  return list.filter((p) => p.role === role);
}

export function getPlayerBySlug(slug: string): Player | undefined {
  return (players as Player[]).find((p) => p.slug === slug);
}

export function getSponsors(): Sponsor[] {
  return sponsors as Sponsor[];
}

export function getSponsorById(id: string): Sponsor | undefined {
  return getSponsors().find((s) => s.id === id);
}

const sponsorProfiles = allSponsorProfiles as SponsorProfile[];

export function getSponsorProfiles(): SponsorProfile[] {
  return sponsorProfiles;
}

export function getSponsorProfileBySlug(slug: string): SponsorProfile | undefined {
  return sponsorProfiles.find((p) => p.slug === slug);
}

export function speechLangFromNationality(nationality?: string): string {
  switch (nationality) {
    case "NED":
      return "nl-NL";
    case "FRA":
      return "fr-FR";
    case "HUN":
      return "hu-HU";
    case "ITA":
      return "it-IT";
    case "DEN":
      return "da-DK";
    case "NOR":
      return "nb-NO";
    default:
      return "de-DE";
  }
}

export function getLogoStatus() {
  const all = getClubs();
  const ready = all.filter((c) => c.hasLogo);
  return { total: all.length, ready: ready.length, missing: all.filter((c) => !c.hasLogo) };
}

export function matchContextLabel(match: Match): string {
  const place = match.isHome ? "Heim" : "Auswärts";
  if (match.competitionKind === "liga" && match.matchday != null) {
    return `${place} · Spieltag ${match.matchday}`;
  }
  if (match.round) {
    return `${place} · ${match.round}`;
  }
  return `${place} · ${match.competitionLabel}`;
}
