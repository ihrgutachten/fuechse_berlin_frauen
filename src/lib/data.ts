import clubs from "@/data/clubs.json";
import matches from "@/data/matches.json";
import standings from "@/data/standings.json";
import news from "@/data/news.json";
import players from "@/data/players.json";
import sponsors from "@/data/sponsors.json";
import sponsorOrthoPed from "@/data/sponsor-profiles/sponsor-ortho-ped.json";
import sponsorMalermeisterRewolinski from "@/data/sponsor-profiles/sponsor-malermeister-rewolinski.json";
import { TICKET_SHOP_URL } from "@/lib/tickets";

export type CompetitionKind = "liga" | "pokal" | "turnier";

export type Club = {
  slug: string;
  name: string;
  short: string;
  city: string;
  venue?: string;
  venueAddress?: string;
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
  startsAt: string;
  streamUrl?: string | null;
  ticketUrl?: string | null;
  homeScore?: number;
  awayScore?: number;
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
  address: string;
  phone?: string;
  email: string;
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

function hydrateMatch(record: MatchRecord): Match {
  const home = getClubBySlug(record.homeSlug);
  const away = getClubBySlug(record.awaySlug);
  if (!home || !away) {
    throw new Error(`Unknown club in match ${record.id}`);
  }

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
    status: record.status,
    fmpMatchId: record.fmpMatchId ?? null,
  };
}

export function getMatchById(id: string): Match | undefined {
  return getMatches().find((match) => match.id === id);
}

/** Last finished or live Pflichtspiel that has an official FMP report id. */
export function getLastMatchWithReport(): Match | undefined {
  return getMatches()
    .filter(
      (match) =>
        Boolean(match.fmpMatchId) &&
        (match.status === "finished" || match.status === "live"),
    )
    .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt))[0];
}

export function getMatches(kind?: CompetitionKind | "all"): Match[] {
  const list = (matches as MatchRecord[])
    .map(hydrateMatch)
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));

  if (!kind || kind === "all") return list;
  return list.filter((m) => m.competitionKind === kind);
}

export type MatchEmphasis = "past" | "next" | "upcoming";

/** Nächstes Pflichtspiel (Liga/Pokal); Turniere nur als Fallback. */
export function pickNextMatch(matches: Match[], now = Date.now()): Match | undefined {
  const upcoming = matches.filter(
    (m) => m.status === "scheduled" && +new Date(m.startsAt) >= now,
  );
  return (
    upcoming.find((m) => m.competitionKind === "liga" || m.competitionKind === "pokal") ??
    upcoming[0]
  );
}

export function getNextMatch(): Match | undefined {
  return pickNextMatch(getMatches());
}

export function getNextHomeMatch(): Match | undefined {
  return pickNextMatch(getMatches().filter((m) => m.isHome));
}

export function getMatchEmphasis(
  match: Match,
  nextId: string | undefined,
  now?: number,
): MatchEmphasis {
  if (nextId && match.id === nextId) return "next";
  if (match.status === "finished" || match.status === "live") return "past";
  if (now != null && +new Date(match.startsAt) < now) return "past";
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

export function getStandings(): StandingRow[] {
  return (
    standings as Array<Omit<StandingRow, "team" | "short" | "isUs" | "hasLogo" | "logo">>
  ).map((row) => {
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

const sponsorProfiles: SponsorProfile[] = [
  sponsorOrthoPed as SponsorProfile,
  sponsorMalermeisterRewolinski as SponsorProfile,
];

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
