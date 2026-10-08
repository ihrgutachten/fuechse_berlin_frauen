"use client";

import { useState, useTransition } from "react";
import { toggleModule } from "@/app/admin/modules/actions";
import type { ModuleKey } from "@/lib/modules";

export function ModuleToggle({
  moduleKey,
  enabled,
}: {
  moduleKey: ModuleKey;
  enabled: boolean;
}) {
  const [on, setOn] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const next = !on;
    setOn(next);
    setError(null);
    startTransition(async () => {
      const res = await toggleModule(moduleKey, next);
      if (!res.ok) {
        setOn(!next); // zuruecksetzen
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={on ? "Modul deaktivieren" : "Modul aktivieren"}
        disabled={pending}
        onClick={handleToggle}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition disabled:opacity-50 ${
          on
            ? "border-[var(--fb-accent)] bg-[var(--fb-accent)]"
            : "border-[var(--fb-border)] bg-[var(--fb-soft)]"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            on ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fb-text-muted)]">
        {on ? "An" : "Aus"}
      </span>
      {error ? <span className="text-xs text-[var(--fb-away)]">{error}</span> : null}
    </div>
  );
}
