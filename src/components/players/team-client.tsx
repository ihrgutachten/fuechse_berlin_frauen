"use client";

import { useMemo, useState } from "react";
import { PlayerCard } from "@/components/players/player-card";
import type { Player, TeamRole } from "@/lib/data";
import { cn } from "@/lib/format";

type Filter = "all" | TeamRole;

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "spielerin", label: "Spielerinnen" },
  { key: "coach", label: "Coach" },
  { key: "staff", label: "Staff" },
];

export function TeamClient({ members }: { members: Player[] }) {
  const [filter, setFilter] = useState<Filter>("spielerin");

  const visible = useMemo(
    () => (filter === "all" ? members : members.filter((m) => m.role === filter)),
    [filter, members],
  );

  const counts = useMemo(() => {
    const base = { all: members.length, spielerin: 0, coach: 0, staff: 0 };
    for (const m of members) base[m.role] += 1;
    return base;
  }, [members]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Team filtern">
        {filters.map(({ key, label }) => {
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((member) => (
          <PlayerCard key={member.slug} player={member} />
        ))}
      </div>
    </div>
  );
}
