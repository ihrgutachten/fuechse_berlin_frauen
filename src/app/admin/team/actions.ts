"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { positionLabelFor } from "@/lib/player-positions";
import {
  createPlayer,
  updatePlayer,
  setPlayerActive as setPlayerActiveRow,
  getPlayerById,
  type PlayerInput,
  type PlayerRole,
} from "@/lib/players-db";

export type PlayerFormInput = {
  id?: string;
  name: string;
  number: string;
  role: PlayerRole;
  position: string;
  funktion: string;
  nickname: string;
  birthPlace: string;
  joined: string;
  height: string;
  previousClubs: string;
  patron: string;
  patronUrl: string;
  photo: string | null;
  nationality: string;
  bio: string;
  active: boolean;
};

export type SaveResult = { ok: false; error: string };

function empty(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseNumber(value: string): number | null | "invalid" {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d{1,2}$/.test(trimmed)) return "invalid";
  const n = Number(trimmed);
  if (n < 1 || n > 99) return "invalid";
  return n;
}

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session?.user?.admin);
}

function toInput(input: PlayerFormInput): PlayerInput | SaveResult {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name fehlt." };
  const role: PlayerRole =
    input.role === "coach" || input.role === "staff" ? input.role : "spielerin";
  const number = parseNumber(input.number);
  if (number === "invalid") return { ok: false, error: "Nummer muss zwischen 1 und 99 liegen." };
  const position = role === "spielerin" ? input.position.trim() : input.funktion.trim();
  if (!position) {
    return { ok: false, error: role === "spielerin" ? "Position fehlt." : "Funktion fehlt." };
  }
  return {
    name,
    number,
    role,
    position: role === "spielerin" ? position : input.funktion.trim(),
    positionLabel: role === "spielerin" ? positionLabelFor(position) : input.funktion.trim(),
    nickname: empty(input.nickname),
    birthPlace: empty(input.birthPlace),
    joined: empty(input.joined),
    height: empty(input.height),
    previousClubs: empty(input.previousClubs),
    patron: empty(input.patron),
    patronUrl: empty(input.patronUrl),
    photo: input.photo?.trim() ?? "",
    nationality: empty(input.nationality),
    bio: empty(input.bio),
    active: input.active,
  };
}

function revalidatePlayer(slug?: string) {
  revalidatePath("/admin/team");
  revalidatePath("/team");
  revalidatePath("/team/statistiken");
  revalidatePath("/");
  if (slug) revalidatePath(`/team/${slug}`);
}

export async function savePlayer(input: PlayerFormInput): Promise<SaveResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Keine Berechtigung." };
  const payload = toInput(input);
  if ("ok" in payload) return payload;

  if (input.id) {
    const existing = await getPlayerById(input.id);
    const res = await updatePlayer(input.id, payload);
    if (!res.ok) return { ok: false, error: "Speichern fehlgeschlagen." };
    revalidatePlayer(existing?.slug);
  } else {
    const res = await createPlayer(payload);
    if (!res.ok) return { ok: false, error: "Speichern fehlgeschlagen." };
    revalidatePlayer();
  }

  redirect("/admin/team");
}

export async function setPlayerActive(id: string, active: boolean): Promise<SaveResult | { ok: true }> {
  if (!(await requireAdmin())) return { ok: false, error: "Keine Berechtigung." };
  const existing = await getPlayerById(id);
  const res = await setPlayerActiveRow(id, active);
  if (!res.ok) return { ok: false, error: "Status konnte nicht gespeichert werden." };
  revalidatePlayer(existing?.slug);
  return { ok: true };
}
