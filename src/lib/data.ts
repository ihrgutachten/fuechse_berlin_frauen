import clubs from "@/data/clubs.json";
import matches from "@/data/matches.json";
import standings from "@/data/standings.json";
import news from "@/data/news.json";
import players from "@/data/players.json";
import sponsors from "@/data/sponsors.json";

export type CompetitionKind = "liga" | "pokal" | "turnier";

export type Club = {
  slug: string;
  name: string;
  short: string;
  city: string;
  venue?: string;
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
  isHome: boolean;
  streamUrl?: string | null;
  ticketUrl?: string | null;
  homeScore?: number;
  awayScore?: number;
  status: "scheduled" | "live" | "finished";
};

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

export type Player = {
  slug: string;
  name: string;
  number: number;
  position: string;
  nationality: string;
  height: string;
  bio: string;
};

export type Sponsor = {
  id: string;
  name: string;
  tier: "haupt" | "partner" | "foerderer";
  url: string;
};

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

  return {
    id: record.id,
    competitionKind: record.competitionKind,
    competitionLabel: record.competitionLabel,
    matchday: record.matchday ?? null,
    round: record.round ?? null,
    home: toTeamSide(home),
    away: toTeamSide(away),
    startsAt: record.startsAt,
    venue: record.venue ?? host.venue ?? `Spielstätte ${host.city}`,
    city: record.city ?? host.city,
    isHome,
    streamUrl,
    ticketUrl: record.ticketUrl ?? null,
    homeScore: record.homeScore,
    awayScore: record.awayScore,
    status: record.status,
  };
}

export function getMatches(kind?: CompetitionKind | "all"): Match[] {
  const list = (matches as MatchRecord[])
    .map(hydrateMatch)
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));

  if (!kind || kind === "all") return list;
  return list.filter((m) => m.competitionKind === kind);
}

/** Nächstes Pflichtspiel (Liga/Pokal); Turniere nur als Fallback. */
export function getNextMatch(): Match | undefined {
  const now = Date.now();
  const upcoming = getMatches().filter(
    (m) => m.status === "scheduled" && +new Date(m.startsAt) >= now,
  );
  return (
    upcoming.find((m) => m.competitionKind === "liga" || m.competitionKind === "pokal") ??
    upcoming[0]
  );
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
  return players as Player[];
}

export function getPlayerBySlug(slug: string): Player | undefined {
  return getPlayers().find((p) => p.slug === slug);
}

export function getSponsors(): Sponsor[] {
  return sponsors as Sponsor[];
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
