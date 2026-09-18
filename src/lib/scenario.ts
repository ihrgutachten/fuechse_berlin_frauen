export type ScenarioScore = { home: number; away: number };

export type ScenarioTips = Record<string, ScenarioScore>;

export type ScenarioTeamCard = {
  slug: string;
  name: string;
  short: string;
  hasLogo: boolean;
  logo: string;
  isUs: boolean;
};

export type ScenarioFixture = {
  id: string;
  matchday: number;
  startsAt: string;
  dayLabel: string;
  timeLabel: string;
  home: ScenarioTeamCard;
  away: ScenarioTeamCard;
};

export type ScenarioStanding = {
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

export type TableZone = "up" | "playoff" | "down" | null;

export const SCENARIO_MAX_GOALS = 60;

export function isCompleteScore(value: unknown): value is ScenarioScore {
  if (!value || typeof value !== "object") return false;
  const home = (value as ScenarioScore).home;
  const away = (value as ScenarioScore).away;
  return Number.isInteger(home) && Number.isInteger(away) && home >= 0 && away >= 0 && home <= SCENARIO_MAX_GOALS && away <= SCENARIO_MAX_GOALS;
}

export function tableZone(rank: number): TableZone {
  if (rank === 1) return "up";
  if (rank === 2) return "playoff";
  if (rank >= 15) return "down";
  return null;
}

export function involvesUs(fixture: ScenarioFixture): boolean {
  return fixture.home.isUs || fixture.away.isUs;
}

export function applyScenario(
  base: ScenarioStanding[],
  fixtures: ScenarioFixture[],
  tips: ScenarioTips,
): ScenarioStanding[] {
  const table = new Map(base.map((row) => [row.teamSlug, { ...row }]));
  const byId = new Map(fixtures.map((fixture) => [fixture.id, fixture]));

  for (const [id, score] of Object.entries(tips)) {
    const fixture = byId.get(id);
    if (!fixture || !isCompleteScore(score)) continue;
    const home = table.get(fixture.home.slug);
    const away = table.get(fixture.away.slug);
    if (!home || !away) continue;
    applyResult(home, away, score.home, score.away);
  }

  return rankStandingRows([...table.values()]);
}

function applyResult(
  home: ScenarioStanding,
  away: ScenarioStanding,
  homeScore: number,
  awayScore: number,
) {
  home.played += 1;
  away.played += 1;
  home.goalsFor += homeScore;
  home.goalsAgainst += awayScore;
  away.goalsFor += awayScore;
  away.goalsAgainst += homeScore;

  if (homeScore > awayScore) {
    home.won += 1;
    home.points += 2;
    away.lost += 1;
  } else if (homeScore < awayScore) {
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

function rankStandingRows(rows: ScenarioStanding[]): ScenarioStanding[] {
  const sorted = [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = a.goalsFor - a.goalsAgainst;
    const diffB = b.goalsFor - b.goalsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamSlug.localeCompare(b.teamSlug, "de");
  });

  const ranked: ScenarioStanding[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (
      j + 1 < sorted.length &&
      sorted[j + 1].points === sorted[i].points &&
      sorted[j + 1].goalsFor - sorted[j + 1].goalsAgainst ===
        sorted[i].goalsFor - sorted[i].goalsAgainst &&
      sorted[j + 1].goalsFor === sorted[i].goalsFor
    ) {
      j += 1;
    }
    const rank = i + 1;
    for (let k = i; k <= j; k++) {
      ranked.push({ ...sorted[k], rank });
    }
    i = j + 1;
  }
  return ranked;
}

export function fuechseHeadline(rows: ScenarioStanding[], tipCount: number): string {
  const us = rows.find((row) => row.isUs);
  if (!us) return "Tippe offene Spiele. Die Tabelle aktualisiert sich sofort.";
  const prefix = tipCount > 0 ? "Mit deinen Tipps stehen die Füchse" : "Die Füchse stehen";
  if (us.rank === 1) return `${prefix} auf Platz 1. Direkter Aufstieg.`;
  if (us.rank === 2) return `${prefix} auf Platz 2. Relegation um den Aufstieg.`;
  const second = rows.find((row) => row.rank === 2);
  const leader = rows.find((row) => row.rank === 1);
  const target = second ?? leader;
  if (!target) return `${prefix} auf Platz ${us.rank}.`;
  const gap = target.points - us.points;
  if (gap <= 0) return `${prefix} auf Platz ${us.rank}.`;
  const pkt = gap === 1 ? "1 Punkt" : `${gap} Punkte`;
  return `${prefix} auf Platz ${us.rank}, ${pkt} hinter Platz ${target.rank}.`;
}
