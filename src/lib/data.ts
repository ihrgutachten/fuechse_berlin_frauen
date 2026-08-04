import matches from "@/data/matches.json";
import standings from "@/data/standings.json";
import news from "@/data/news.json";
import players from "@/data/players.json";
import sponsors from "@/data/sponsors.json";

export type TeamSide = {
  name: string;
  short: string;
  isUs: boolean;
};

export type Match = {
  id: string;
  competition: string;
  matchday: number;
  home: TeamSide;
  away: TeamSide;
  startsAt: string;
  venue: string;
  city: string;
  isHome: boolean;
  streamUrl?: string;
  ticketUrl?: string | null;
  homeScore?: number;
  awayScore?: number;
  status: "scheduled" | "live" | "finished";
};

export type StandingRow = {
  rank: number;
  team: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  isUs: boolean;
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

export function getMatches(): Match[] {
  return matches as Match[];
}

export function getNextMatch(): Match | undefined {
  return getMatches()
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))[0];
}

export function getStandings(): StandingRow[] {
  return standings as StandingRow[];
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
