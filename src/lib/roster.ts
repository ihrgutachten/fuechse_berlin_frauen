import { cache } from "react";
import players from "@/data/players.json";
import { type Player, type TeamRole } from "@/lib/data";
import { listPlayers, type PlayerRecord } from "@/lib/players-db";

function playerFromRecord(record: PlayerRecord): Player {
  return {
    slug: record.slug,
    name: record.name,
    number: record.number,
    role: record.role,
    position: record.position,
    positionLabel: record.positionLabel,
    nickname: record.nickname ?? undefined,
    birthPlace: record.birthPlace ?? undefined,
    joined: record.joined ?? undefined,
    height: record.height ?? undefined,
    previousClubs: record.previousClubs ?? undefined,
    patron: record.patron ?? undefined,
    patronUrl: record.patronUrl ?? undefined,
    photo: record.photo,
    nationality: record.nationality ?? undefined,
    bio: record.bio ?? undefined,
    nameAudio: record.nameAudio ?? undefined,
    nameLang: record.nameLang ?? undefined,
    namePhonetic: record.namePhonetic ?? undefined,
    active: record.active,
  };
}

function staticRoster(): Player[] {
  return (players as Player[]).map((player) => ({ ...player, active: player.active !== false }));
}

/** Kader aus der Datenbank, sonst die statische Datei. Inklusive inaktiver Spielerinnen. */
export const getRoster = cache(async (): Promise<Player[]> => {
  try {
    const db = await listPlayers();
    if (db && db.length > 0) return db.map(playerFromRecord);
  } catch (err) {
    console.error("[players] db", err);
  }
  return staticRoster();
});

/** Öffentliche Teamseite: nur aktive Einträge. */
export async function getTeamMembers(role?: TeamRole | "all"): Promise<Player[]> {
  const list = (await getRoster()).filter((player) => player.active !== false);
  if (!role || role === "all") return list;
  return list.filter((player) => player.role === role);
}

export async function getPlayerBySlug(slug: string): Promise<Player | undefined> {
  return (await getRoster()).find((player) => player.slug === slug);
}
