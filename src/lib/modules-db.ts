import { unstable_cache } from "next/cache";
import { getSql } from "@/lib/db";
import {
  MODULES,
  MODULE_BY_KEY,
  defaultModuleState,
  type ModuleKey,
} from "@/lib/modules";

/** Cache-Tag fuer die Modul-Flags. Beim Umschalten revalidieren. */
export const MODULE_FLAGS_TAG = "module-flags";

let schemaReady: Promise<void> | null = null;

/**
 * CREATE TABLE IF NOT EXISTS ist in Postgres nicht vollstaendig serialisiert:
 * feuern mehrere Verbindungen gleichzeitig (z. B. parallele Build-Worker),
 * kann die Erstanlage mit "duplicate key"/"already exists" kollidieren. Das
 * bedeutet faktisch "Tabelle existiert bereits" und ist unkritisch.
 */
function isBenignSchemaRace(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("already exists") ||
    msg.includes("duplicate key value") ||
    msg.includes("pg_type_typname_nsp_index")
  );
}

async function ensureSchema(): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS module_flags (
            key TEXT PRIMARY KEY,
            enabled BOOLEAN NOT NULL DEFAULT TRUE,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `;
      } catch (err) {
        if (isBenignSchemaRace(err)) return;
        throw err;
      }
    })().catch((err: unknown) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

/** Rohdaten aus der DB: nur die abweichenden Eintraege (key -> enabled). */
async function readOverrides(): Promise<Record<string, boolean>> {
  const sql = getSql();
  if (!sql) return {};
  await ensureSchema();
  const rows = (await sql`SELECT key, enabled FROM module_flags`) as Array<{
    key: string;
    enabled: boolean;
  }>;
  const map: Record<string, boolean> = {};
  for (const row of rows) map[row.key] = row.enabled;
  return map;
}

/**
 * Gecachte Variante. `unstable_cache` liest keine Cookies/Header, daher bleiben
 * Seiten, die das hier aufrufen, weiter statisch/ISR-faehig. Invalidierung ueber
 * MODULE_FLAGS_TAG beim Umschalten.
 */
const readOverridesCached = unstable_cache(readOverrides, ["module-flags"], {
  tags: [MODULE_FLAGS_TAG],
});

/** Effektiver Zustand aller Module: DB-Override oder Registry-Default. */
export async function getModuleState(): Promise<Record<ModuleKey, boolean>> {
  const state = defaultModuleState();
  let overrides: Record<string, boolean> = {};
  try {
    overrides = await readOverridesCached();
  } catch (err) {
    console.error("[modules] overrides unreadable:", err instanceof Error ? err.message : err);
    return state;
  }
  for (const m of MODULES) {
    if (m.key in overrides) state[m.key] = overrides[m.key];
  }
  return state;
}

/** Komfort-Check fuer einzelne Module (z. B. Route-Guard). */
export async function isModuleEnabled(key: ModuleKey): Promise<boolean> {
  const state = await getModuleState();
  return state[key];
}

/** Flag setzen. Wirft, wenn DB fehlt oder Modul nicht schaltbar ist. */
export async function setModuleEnabled(key: ModuleKey, enabled: boolean): Promise<void> {
  const def = MODULE_BY_KEY[key];
  if (!def) throw new Error(`Unbekanntes Modul: ${key}`);
  if (!def.toggleable) throw new Error(`Modul nicht schaltbar: ${key}`);
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL fehlt.");
  await ensureSchema();
  await sql`
    INSERT INTO module_flags (key, enabled, updated_at)
    VALUES (${key}, ${enabled}, NOW())
    ON CONFLICT (key) DO UPDATE SET enabled = ${enabled}, updated_at = NOW()
  `;
}
