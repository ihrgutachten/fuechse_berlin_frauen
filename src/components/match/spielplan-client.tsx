"use client";

import { useMemo, useState } from "react";
import { MatchCard } from "@/components/match/match-card";
import type { CompetitionKind, Match } from "@/lib/data";
import { competitionLabels } from "@/lib/data";
import { cn } from "@/lib/format";

type Filter = "all" | CompetitionKind;

const filters: Filter[] = ["all", "liga", "pokal", "turnier"];

export function SpielplanClient({ matches }: { matches: Match[] }) {
  const [filter, setFilter] = useState<Filter>("liga");

  const visible = useMemo(
    () => (filter === "all" ? matches : matches.filter((m) => m.competitionKind === filter)),
    [filter, matches],
  );

  const counts = useMemo(() => {
    const base = { all: matches.length, liga: 0, pokal: 0, turnier: 0 };
    for (const m of matches) base[m.competitionKind] += 1;
    return base;
  }, [matches]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Wettbewerb filtern">
        {filters.map((key) => {
          const label = key === "all" ? "Alle" : competitionLabels[key];
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-[var(--fb-radius)] px-3 py-1.5 text-sm font-semibold transition",
                active
                  ? "bg-[var(--fb-green-950)] text-white"
                  : "bg-[var(--fb-soft)] text-[var(--fb-text-muted)] hover:bg-[var(--fb-soft-2)]",
              )}
            >
              {label}
              <span className="ml-1.5 tabular-nums opacity-70">{counts[key]}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-[var(--fb-radius)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] px-4 py-6 text-sm text-[var(--fb-text-muted)]">
          Keine Spiele in dieser Kategorie.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {visible.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
