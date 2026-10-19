import playersJson from "@/data/players.json";
import { getSql } from "@/lib/db";
import { positionLabelFor } from "@/lib/player-positions";

export type PlayerRole = "spielerin" | "coach" | "staff";

export type PlayerRecord = {
  id: string;
  slug: string;
  name: string;
  number: number | null;
  role: PlayerRole;
  position: string;
  positionLabel: string;
  nickname: string | null;
  birthPlace: string | null;
  joined: string | null;
  height: string | null;
  previousClubs: string | null;
  patron: string | null;
  patronUrl: string | null;
  photo: string;
  nationality: string | null;
  bio: string | null;
  nameAudio: string | null;
  nameLang: string | null;
  namePhonetic: string | null;
  active: boolean;
};

type PlayerRow = {
  id: string;
  slug: string;
  name: string;
  number: number | null;
  role: string;
  position: string;
  position_label: string;
  nickname: string | null;
  birth_place: string | null;
  joined: string | null;
  height: string | null;
  previous_clubs: string | null;
  patron: string | null;
  patron_url: string | null;
  photo: string | null;
  nationality: string | null;
  bio: string | null;
  name_audio: string | null;
  name_lang: string | null;
  name_phonetic: string | null;
  active: boolean;
};

type SeedPlayer = {
  slug: string;
  name: string;
  number?: number | null;
  role?: string;
  position?: string;
  positionLabel?: string;
  nickname?: string;
  birthPlace?: string;
  joined?: string;
  height?: string;
  previousClubs?: string;
  patron?: string;
  patronUrl?: string;
  photo?: string;
  nationality?: string;
  bio?: string;
  nameAudio?: string;
  nameLang?: string;
  namePhonetic?: string;
};

function isRole(value: string): value is PlayerRole {
  return value === "spielerin" || value === "coach" || value === "staff";
}

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

function mapPlayer(row: PlayerRow): PlayerRecord {
  const role = isRole(row.role) ? row.role : "spielerin";
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    number: row.number == null ? null : Number(row.number),
    role,
    position: row.position,
    positionLabel: row.position_label,
    nickname: row.nickname,
    birthPlace: row.birth_place,
    joined: row.joined,
    height: row.height,
    previousClubs: row.previous_clubs,
    patron: row.patron,
    patronUrl: row.patron_url,
    photo: row.photo ?? "",
    nationality: row.nationality,
    bio: row.bio,
    nameAudio: row.name_audio,
    nameLang: row.name_lang,
    namePhonetic: row.name_phonetic,
    active: row.active !== false,
  };
}

let schemaReady: Promise<void> | null = null;

async function ensureSchema(): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS players (
          id TEXT PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          number INTEGER,
          role TEXT NOT NULL DEFAULT 'spielerin',
          position TEXT NOT NULL DEFAULT '',
          position_label TEXT NOT NULL DEFAULT '',
          nickname TEXT,
          birth_place TEXT,
          joined TEXT,
          height TEXT,
          previous_clubs TEXT,
          patron TEXT,
          patron_url TEXT,
          photo TEXT NOT NULL DEFAULT '',
          nationality TEXT,
          bio TEXT,
          name_audio TEXT,
          name_lang TEXT,
          name_phonetic TEXT,
          active BOOLEAN NOT NULL DEFAULT TRUE,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      const countRows = (await sql`SELECT COUNT(*)::int AS count FROM players`) as Array<{
        count: number;
      }>;
      if ((countRows[0]?.count ?? 0) === 0) {
        const seed = playersJson as SeedPlayer[];
        for (let index = 0; index < seed.length; index += 1) {
          const item = seed[index];
          const role = item.role && isRole(item.role) ? item.role : "spielerin";
          await sql`
            INSERT INTO players (
              id, slug, name, number, role, position, position_label,
              nickname, birth_place, joined, height, previous_clubs,
              patron, patron_url, photo, nationality, bio,
              name_audio, name_lang, name_phonetic, active, sort_order
            ) VALUES (
              ${crypto.randomUUID()},
              ${item.slug},
              ${item.name},
              ${item.number ?? null},
              ${role},
              ${item.position ?? ""},
              ${item.positionLabel || item.position || ""},
              ${emptyToNull(item.nickname)},
              ${emptyToNull(item.birthPlace)},
              ${emptyToNull(item.joined)},
              ${emptyToNull(item.height)},
              ${emptyToNull(item.previousClubs)},
              ${emptyToNull(item.patron)},
              ${emptyToNull(item.patronUrl)},
              ${item.photo ?? ""},
              ${emptyToNull(item.nationality)},
              ${emptyToNull(item.bio)},
              ${emptyToNull(item.nameAudio)},
              ${emptyToNull(item.nameLang)},
              ${emptyToNull(item.namePhonetic)},
              ${true},
              ${index}
            )
            ON CONFLICT (slug) DO NOTHING
          `;
        }
      }
    })().catch((err: unknown) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  const sql = getSql();
  const root = slugify(base) || "spielerin";
  if (!sql) return root;
  let candidate = root;
  let n = 2;
  for (;;) {
    const rows = (await sql`SELECT id FROM players WHERE slug = ${candidate} LIMIT 1`) as Array<{
      id: string;
    }>;
    if (!rows[0]) return candidate;
    candidate = `${root}-${n}`;
    n += 1;
  }
}

export async function listPlayers(): Promise<PlayerRecord[] | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM players
    ORDER BY sort_order ASC, number ASC NULLS LAST, name ASC
  `) as PlayerRow[];
  return rows.map(mapPlayer);
}

export async function getPlayerById(id: string): Promise<PlayerRecord | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const rows = (await sql`SELECT * FROM players WHERE id = ${id} LIMIT 1`) as PlayerRow[];
  return rows[0] ? mapPlayer(rows[0]) : null;
}

export type PlayerInput = {
  name: string;
  number: number | null;
  role: PlayerRole;
  position: string;
  positionLabel: string;
  nickname: string | null;
  birthPlace: string | null;
  joined: string | null;
  height: string | null;
  previousClubs: string | null;
  patron: string | null;
  patronUrl: string | null;
  photo: string;
  nationality: string | null;
  bio: string | null;
  active: boolean;
};

export async function createPlayer(input: PlayerInput): Promise<{ ok: boolean; id?: string }> {
  const sql = getSql();
  if (!sql) return { ok: false };
  await ensureSchema();
  const id = crypto.randomUUID();
  const slug = await uniqueSlug(input.name);
  const positionLabel =
    input.role === "spielerin" ? positionLabelFor(input.position) : input.positionLabel;
  await sql`
    INSERT INTO players (
      id, slug, name, number, role, position, position_label,
      nickname, birth_place, joined, height, previous_clubs,
      patron, patron_url, photo, nationality, bio, active
    ) VALUES (
      ${id},
      ${slug},
      ${input.name},
      ${input.number},
      ${input.role},
      ${input.role === "spielerin" ? input.position : input.positionLabel},
      ${positionLabel},
      ${input.nickname},
      ${input.birthPlace},
      ${input.joined},
      ${input.height},
      ${input.previousClubs},
      ${input.patron},
      ${input.patronUrl},
      ${input.photo},
      ${input.nationality},
      ${input.bio},
      ${input.active}
    )
  `;
  return { ok: true, id };
}

export async function updatePlayer(id: string, input: PlayerInput): Promise<{ ok: boolean }> {
  const sql = getSql();
  if (!sql) return { ok: false };
  await ensureSchema();
  const existing = await getPlayerById(id);
  if (!existing) return { ok: false };
  const positionLabel =
    input.role === "spielerin" ? positionLabelFor(input.position) : input.positionLabel;
  await sql`
    UPDATE players SET
      name = ${input.name},
      number = ${input.number},
      role = ${input.role},
      position = ${input.role === "spielerin" ? input.position : input.positionLabel},
      position_label = ${positionLabel},
      nickname = ${input.nickname},
      birth_place = ${input.birthPlace},
      joined = ${input.joined},
      height = ${input.height},
      previous_clubs = ${input.previousClubs},
      patron = ${input.patron},
      patron_url = ${input.patronUrl},
      photo = ${input.photo},
      nationality = ${input.nationality},
      bio = ${input.bio},
      active = ${input.active},
      updated_at = NOW()
    WHERE id = ${id}
  `;
  return { ok: true };
}

export async function setPlayerActive(id: string, active: boolean): Promise<{ ok: boolean }> {
  const sql = getSql();
  if (!sql) return { ok: false };
  await ensureSchema();
  const rows = (await sql`
    UPDATE players SET active = ${active}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id
  `) as Array<{ id: string }>;
  return { ok: rows.length > 0 };
}
