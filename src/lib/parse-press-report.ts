export type ReportPlayer = {
  number: number;
  name: string;
  goals: number;
  sevenMeterMade: number;
  sevenMeterAttempts: number;
  twoMinutes: number;
  warnings: number;
  slug: string | null;
  photo: string | null;
  positionLabel: string | null;
};

export type ReportOfficial = {
  role: string;
  name: string;
};

export type ReportTeam = {
  name: string;
  isUs: boolean;
  players: ReportPlayer[];
  officials: ReportOfficial[];
};

export type MatchReport = {
  attendance: number | null;
  homeScore: number | null;
  awayScore: number | null;
  homeHalftime: number | null;
  awayHalftime: number | null;
  home: ReportTeam;
  away: ReportTeam;
  ourTeam: ReportTeam;
  opponent: ReportTeam;
};

type RosterPlayer = {
  number: number;
  name: string;
};

type RosterTeam = {
  name: string;
  players: RosterPlayer[];
  officials: ReportOfficial[];
};

type PlayerStats = {
  goals: number;
  sevenMeterMade: number;
  sevenMeterAttempts: number;
  twoMinutes: number;
  warnings: number;
};

export type RosterLookup = {
  slug: string;
  name: string;
  number: number | null;
  photo: string;
  positionLabel: string;
  role: string;
};

function isFuechseName(name: string): boolean {
  return /f.?chse/i.test(name);
}

function cleanTeamName(line: string): string {
  return line.replace(/\s*Auszeiten:.*$/i, "").trim();
}

function parsePlayerLine(line: string): RosterPlayer | null {
  const match = line.match(/^(\d{1,2})\s+(.+)$/);
  if (!match || !/[A-Za-zÄÖÜäöüß]/.test(match[2])) return null;
  const name = match[2]
    .trim()
    .replace(/\s+\d{1,2}:\d{2}(\s+\d{1,2}:\d{2})*$/, "")
    .replace(/\s+\d+\/\d+$/, "")
    .replace(/\s+\d+$/, "")
    .trim();
  if (!name) return null;
  return { number: Number(match[1]), name };
}

function parseRosterBlock(lines: string[], start: number): { team: RosterTeam; end: number } {
  let name = "Unbekannt";
  for (let i = start - 1; i >= Math.max(0, start - 12); i--) {
    const cleaned = cleanTeamName(lines[i] ?? "");
    if (cleaned && /[A-Za-zÄÖÜäöüß]/.test(cleaned) && !/^NR\.\s*NAME/i.test(cleaned)) {
      name = cleaned;
      break;
    }
  }

  const players: RosterPlayer[] = [];
  const officials: ReportOfficial[] = [];
  let i = start + 1;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    if (/^NR\.\s*NAME/i.test(line) || /^(Torfolge|Verlauf:|SPIELMINUTE)/i.test(line)) break;

    const official = line.match(/^(O[A-E])\s+(.+)$/i);
    if (official) {
      officials.push({ role: official[1].toUpperCase(), name: official[2].trim() });
      continue;
    }

    const player = parsePlayerLine(line);
    if (player) {
      players.push(player);
      continue;
    }

    if (players.length > 0 && cleanTeamName(line) && /Auszeiten:/i.test(line)) break;
  }

  return { team: { name, players, officials }, end: i };
}

function emptyStats(): PlayerStats {
  return {
    goals: 0,
    sevenMeterMade: 0,
    sevenMeterAttempts: 0,
    twoMinutes: 0,
    warnings: 0,
  };
}

function applyEvents(teams: RosterTeam[], text: string): Map<string, PlayerStats>[] {
  const stats = teams.map((team) => {
    const byNumber = new Map<string, PlayerStats>();
    for (const player of team.players) {
      byNumber.set(String(player.number), emptyStats());
    }
    return byNumber;
  });

  const findTeamIndex = (teamName: string) => {
    const exact = teams.findIndex((team) => isFuechseName(team.name) === isFuechseName(teamName));
    return exact;
  };

  const ensure = (teamIdx: number, number: number) => {
    const key = String(number);
    const map = stats[teamIdx];
    if (!map.has(key)) map.set(key, emptyStats());
    return map.get(key)!;
  };

  const goalRe =
    /(?:^|\s)(7-Meter-Tor|7-Meter-Versuch|Tor) durch .+ \(Nr\.(\d{1,2})\s+(.+?)\)/i;
  const penaltyRe = /\(Nr\.(\d{1,2})\s+(.+?)\) erhielt eine Zeitstrafe/i;
  const warnRe = /\(Nr\.(\d{1,2})\s+(.+?)\) wurde verwarnt/i;

  for (const raw of text.split(/\n/)) {
    const line = raw.trim();
    const goal = line.match(goalRe);
    if (goal) {
      const kind = goal[1].toLowerCase();
      const teamIdx = findTeamIndex(goal[3]);
      if (teamIdx < 0) continue;
      const row = ensure(teamIdx, Number(goal[2]));
      if (kind === "tor" || kind === "7-meter-tor") row.goals += 1;
      if (kind === "7-meter-tor" || kind === "7-meter-versuch") {
        row.sevenMeterAttempts += 1;
        if (kind === "7-meter-tor") row.sevenMeterMade += 1;
      }
      continue;
    }
    const penalty = line.match(penaltyRe);
    if (penalty) {
      const teamIdx = findTeamIndex(penalty[2]);
      if (teamIdx < 0) continue;
      ensure(teamIdx, Number(penalty[1])).twoMinutes += 1;
      continue;
    }
    const warn = line.match(warnRe);
    if (warn) {
      const teamIdx = findTeamIndex(warn[2]);
      if (teamIdx < 0) continue;
      ensure(teamIdx, Number(warn[1])).warnings += 1;
    }
  }

  return stats;
}

function enrich(
  team: RosterTeam,
  isUs: boolean,
  roster: RosterLookup[],
  stats: Map<string, PlayerStats>,
): ReportTeam {
  const players: ReportPlayer[] = team.players.map((player) => {
    const row = stats.get(String(player.number)) ?? emptyStats();
    const match = isUs
      ? roster.find((member) => member.role === "spielerin" && member.number === player.number)
      : undefined;
    return {
      number: player.number,
      name: match?.name ?? player.name,
      goals: row.goals,
      sevenMeterMade: row.sevenMeterMade,
      sevenMeterAttempts: row.sevenMeterAttempts,
      twoMinutes: row.twoMinutes,
      warnings: row.warnings,
      slug: match?.slug ?? null,
      photo: match?.photo ?? null,
      positionLabel: match?.positionLabel ?? null,
    };
  });

  return {
    name: team.name.replace(/F.chse/gi, "Füchse"),
    isUs,
    players,
    officials: team.officials,
  };
}

/** Official full-time line only. Halftime in parentheses. Live PDFs without this are ignored. */
export function parseEndstand(
  rawText: string,
): { homeScore: number; awayScore: number; homeHalftime: number; awayHalftime: number } | null {
  const text = rawText.replace(/\u0000/g, "");
  const score = text.match(
    /Endstand:\s*(\d{1,3})\s*:\s*(\d{1,3})\s*\((\d{1,3})\s*:\s*(\d{1,3})\)/,
  );
  if (!score) return null;
  return {
    homeScore: Number(score[1]),
    awayScore: Number(score[2]),
    homeHalftime: Number(score[3]),
    awayHalftime: Number(score[4]),
  };
}

export function parsePressReport(rawText: string, roster: RosterLookup[] = []): MatchReport | null {
  const text = rawText.replace(/\u0000/g, "").replace(/\r\n/g, "\n");
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const score = parseEndstand(text);
  const crowd = text.match(/Zuschauer:\s*(\d{1,5})/);

  const teams: RosterTeam[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^NR\.\s*NAME/i.test(lines[i])) continue;
    const parsed = parseRosterBlock(lines, i);
    if (parsed.team.players.length > 0) teams.push(parsed.team);
    i = parsed.end - 1;
    if (teams.length >= 2) break;
  }

  if (teams.length < 2) return null;

  const stats = applyEvents(teams, text);
  const homeRaw = teams[0];
  const awayRaw = teams[1];
  const home = enrich(homeRaw, isFuechseName(homeRaw.name), roster, stats[0]);
  const away = enrich(awayRaw, isFuechseName(awayRaw.name), roster, stats[1]);

  return {
    attendance: crowd ? Number(crowd[1]) : null,
    homeScore: score?.homeScore ?? null,
    awayScore: score?.awayScore ?? null,
    homeHalftime: score?.homeHalftime ?? null,
    awayHalftime: score?.awayHalftime ?? null,
    home,
    away,
    ourTeam: home.isUs ? home : away,
    opponent: home.isUs ? away : home,
  };
}
