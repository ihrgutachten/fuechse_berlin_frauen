import Link from "next/link";
import { ModuleToggle } from "@/components/admin/module-toggle";
import { MODULES } from "@/lib/modules";
import { getModuleState } from "@/lib/modules-db";

export const metadata = { title: "Module" };

export default async function AdminModulesPage() {
  const state = await getModuleState();

  return (
    <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-12">
      <Link href="/admin" className="text-sm font-semibold text-[var(--fb-accent)] hover:underline">
        &larr; Admin
      </Link>
      <h1 className="mt-3 font-[family-name:var(--fb-font-display)] text-3xl font-bold uppercase tracking-tight">
        Module
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-[var(--fb-text-muted)]">
        Funktionsbereiche der Seite an- und abschalten. Ist ein Modul aus, verschwindet es
        aus der Navigation beziehungsweise den Tool-Kacheln und die Seite ist nicht mehr
        erreichbar. Kernbereiche wie Team und Tabelle sind fest aktiv.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => {
          const on = state[m.key];
          const geplant = m.status === "geplant";
          return (
            <div
              key={m.key}
              className={`flex items-start justify-between gap-4 rounded-[var(--fb-radius-lg)] border bg-white p-5 ${
                geplant ? "border-dashed border-[var(--fb-border)] opacity-70" : "border-[var(--fb-border)]"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-[family-name:var(--fb-font-display)] text-lg font-bold uppercase">
                    {m.label}
                  </h2>
                  {geplant ? (
                    <span className="rounded-full bg-[var(--fb-soft)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--fb-text-muted)]">
                      In Vorbereitung
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-sm text-[var(--fb-text-muted)]">{m.description}</p>
                {m.status === "live" ? (
                  <Link
                    href={m.href}
                    className="mt-2 inline-flex text-xs font-semibold text-[var(--fb-accent)] hover:underline"
                  >
                    Seite ansehen
                  </Link>
                ) : null}
              </div>

              <div className="shrink-0">
                {m.toggleable ? (
                  <ModuleToggle moduleKey={m.key} enabled={on} />
                ) : (
                  <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-[var(--fb-text-muted)]">
                    {geplant ? "Bald" : "Immer aktiv"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
