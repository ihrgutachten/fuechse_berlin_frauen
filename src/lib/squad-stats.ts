import { getRoster } from "@/lib/roster";
import {
  PLAYER_STATS_SOURCE_URL,
  matchRosterPlayer,
  parseSquadSeason,
  type SquadSeasonStat,
} from "@/lib/player-stats-sync";

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: "Tor",
  left_winger: "Linksaußen",
  right_winger: "Rechtsaußen",
  left_back: "Rückraum links",
  right_back: "Rückraum rechts",
  centre_back: "Rückraum Mitte",
  pivot: "Kreis",
};

export type SquadStatRow = SquadSeasonStat & {
  slug: string | null;
  photo: string | null;
  positionLabel: string;
  number: number | null;
};

export async function getSquadSeason(): Promise<SquadStatRow[]> {
  try {
    const res = await fetch(PLAYER_STATS_SOURCE_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (compatible; FuechseBerlinFrauen/1.0; +https://fuechse-berlin-frauen.de)",
      },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const roster = (await getRoster()).filter((player) => player.role === "spielerin");
    const lookup = roster.map((player) => ({
      slug: player.slug,
      name: player.name,
      photo: player.photo,
      positionLabel: player.positionLabel,
      role: player.role,
    }));
    return parseSquadSeason(await res.json())
      .map((row) => {
        const match = matchRosterPlayer(row.firstName, row.lastName, lookup);
        const member = match ? roster.find((player) => player.slug === match.slug) : undefined;
        return {
          ...row,
          slug: match?.slug ?? null,
          photo: match?.photo ?? null,
          positionLabel: match?.positionLabel || POSITION_LABEL[row.position] || "",
          number: member?.number ?? row.shirtNumber,
        };
      })
      .sort(
        (a, b) =>
          b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name, "de"),
      );
  } catch (err) {
    console.error("[squad-stats]", err instanceof Error ? err.message : err);
    return [];
  }
}
