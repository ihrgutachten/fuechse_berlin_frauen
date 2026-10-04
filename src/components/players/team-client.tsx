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

const positionGroups: { key: string; label: string; match: string[] }[] = [
  { key: "tor", label: "Tor", match: ["TW"] },
  { key: "rueckraum", label: "Rückraum", match: ["RL", "RM", "RR", "RM/RR"] },
  { key: "aussen", label: "Außen", match: ["RA", "LA"] },
  { key: "kreis", label: "Kreis", match: ["KM"] },
];

function positionGroupKey(position: string): string {
  return positionGroups.find((g) => g.match.includes(position))?.key ?? "sonst";
}

const cardGridClass = "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4";

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

      {filter === "spielerin" ? (
        <div className="space-y-8">
          {positionGroups.map((group) => {
            const inGroup = visible.filter(
              (m) => positionGroupKey(m.position) === group.key,
            );
            if (inGroup.length === 0) return null;
            return (
              <section key={group.key} className="space-y-3">
                <h3 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-text-faint)]">
                  {group.label}
                  <span className="h-px flex-1 bg-[var(--fb-border)]" />
                </h3>
                <div className={cardGridClass}>
                  {inGroup.map((member) => (
                    <PlayerCard key={member.slug} player={member} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className={cardGridClass}>
          {visible.map((member) => (
            <PlayerCard key={member.slug} player={member} />
          ))}
        </div>
      )}
    </div>
  );
}
