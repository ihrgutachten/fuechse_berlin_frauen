"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { getMatchById } from "@/lib/data";
import { isDatabaseConfigured } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getProfile, upsertPrediction, upsertProfile } from "@/lib/tippspiel-db";
import { getTipPhase, isTipLocked, normalizeNickname, parseScore } from "@/lib/tippspiel";

export type ActionState = { ok: true; message: string } | { ok: false; error: string } | null;

export async function saveNickname(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Tippspiel ist gerade nicht erreichbar." };
  }

  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?next=/tools/tippspiel");

  const nickname = normalizeNickname(String(formData.get("nickname") ?? ""));
  if (!nickname) {
    return {
      ok: false,
      error: "3-20 Zeichen: Buchstaben, Zahlen, Punkt, Unterstrich oder Bindestrich.",
    };
  }

  const marketingOptIn = formData.get("marketing") === "on";
  const result = await upsertProfile({ userId, nickname, marketingOptIn });
  if (!result.ok) {
    if (result.error === "taken") {
      return { ok: false, error: "Dieser Name ist schon vergeben." };
    }
    return { ok: false, error: "Speichern fehlgeschlagen. Bitte später erneut versuchen." };
  }

  revalidatePath("/tools/tippspiel");
  return { ok: true, message: "Anzeigename gespeichert." };
}

export async function savePrediction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Tippspiel ist gerade nicht erreichbar." };
  }

  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?next=/tools/tippspiel");

  let profile = await getProfile(userId);
  if (!profile) {
    const nickname = normalizeNickname(String(formData.get("nickname") ?? ""));
    if (!nickname) {
      return {
        ok: false,
        error: "Bitte einen Anzeigenamen setzen (3-20 Zeichen).",
      };
    }
    const created = await upsertProfile({
      userId,
      nickname,
      marketingOptIn: formData.get("marketing") === "on",
    });
    if (!created.ok) {
      if (created.error === "taken") {
        return { ok: false, error: "Dieser Name ist schon vergeben." };
      }
      return { ok: false, error: "Speichern fehlgeschlagen. Bitte später erneut versuchen." };
    }
    profile = await getProfile(userId);
    if (!profile) {
      return { ok: false, error: "Speichern fehlgeschlagen. Bitte später erneut versuchen." };
    }
  }

  const matchId = String(formData.get("matchId") ?? "");
  const match = getMatchById(matchId);
  if (!match) {
    return { ok: false, error: "Spiel nicht gefunden." };
  }
  if (match.competitionKind === "turnier") {
    return { ok: false, error: "Nur Liga- und Pokalspiele sind im Tippspiel." };
  }
  if (isTipLocked(match) || getTipPhase(match) !== "open") {
    return { ok: false, error: "Tippschluss. Der Anpfiff läuft oder ist vorbei." };
  }

  const homeScore = parseScore(formData.get("homeScore"));
  const awayScore = parseScore(formData.get("awayScore"));
  if (homeScore == null || awayScore == null) {
    return { ok: false, error: "Bitte zwei gültige Tore (0-60) angeben." };
  }

  const result = await upsertPrediction({ userId, matchId, homeScore, awayScore });
  if (!result.ok) {
    return { ok: false, error: "Tipp konnte nicht gespeichert werden." };
  }

  revalidatePath("/tools/tippspiel");
  revalidatePath("/matchday");
  return { ok: true, message: "Tipp gespeichert. Bis zum Anpfiff kannst du ihn noch ändern." };
}

export async function signOutTippspiel() {
  await signOut({ redirectTo: "/tools/tippspiel" });
}
