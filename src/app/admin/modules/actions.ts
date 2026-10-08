"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getSession } from "@/lib/session";
import { MODULE_FLAGS_TAG, setModuleEnabled } from "@/lib/modules-db";
import { MODULE_BY_KEY, type ModuleKey } from "@/lib/modules";

export type ToggleResult = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session?.user?.admin);
}

export async function toggleModule(key: ModuleKey, enabled: boolean): Promise<ToggleResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Keine Berechtigung." };

  const def = MODULE_BY_KEY[key];
  if (!def) return { ok: false, error: "Unbekanntes Modul." };
  if (!def.toggleable) return { ok: false, error: "Modul ist nicht schaltbar." };

  try {
    await setModuleEnabled(key, enabled);
  } catch (err) {
    console.error("[modules] toggle failed:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Speichern fehlgeschlagen." };
  }

  // Daten-Cache der Flags leeren (read-your-own-writes in Server Action) ...
  updateTag(MODULE_FLAGS_TAG);
  // ... und die Navigation (Root-Layout) auf allen Seiten neu rendern.
  revalidatePath("/", "layout");
  return { ok: true };
}
