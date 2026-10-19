"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setPlayerActive } from "@/app/admin/team/actions";
import { positionGroupFor } from "@/lib/player-positions";
import type { PlayerRecord, PlayerRole } from "@/lib/players-db";
import { cn } from "@/lib/format";

type RoleFilter = "spielerin" | "team" | "all";
type StatusFilter = "all" | "aktiv" | "inaktiv";
type SortKey = "number" | "name";

const roleFilters: { key: RoleFilter; label: string }[] = [
  { key: "spielerin", label: "Spielerinnen" },
  { key: "team", label: "Trainer und Team" },
  { key: "all", label: "Alle" },
];

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "aktiv", label: "Aktiv" },
  { key: "inaktiv", label: "Inaktiv" },
];

const positionFilters = [
  { key: "all", label: "Alle Positionen" },
  { key: "tor", label: "Tor" },
  { key: "rueckraum", label: "Rückraum" },
  { key: "aussen", label: "Außen" },
  { key: "kreis", label: "Kreis" },
];

function isTeamRole(role: PlayerRole): boolean {
  return role === "coach" || role === "staff";
}

export function PlayerGrid({ players }: { players: PlayerRecord[] }) {
  const router = useRouter();
  const [role, setRole] = useState<RoleFilter>("spielerin");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [position, setPosition] = useState("all");
  const [sort, setSort] = useState<SortKey>("number");
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("de");
    const filtered = players.filter((player) => {
      if (role === "spielerin" && player.role !== "spielerin") return false;
      if (role === "team" && !isTeamRole(player.role)) return false;
      if (status === "aktiv" && !player.active) return false;
      if (status === "inaktiv" && player.active) return false;
      if (role === "spielerin" && position !== "all" && positionGroupFor(player.position) !== position) {
        return false;
      }
      if (q && !player.name.toLocaleLowerCase("de").includes(q)) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "de");
      const an = a.number ?? 999;
      const bn = b.number ?? 999;
      if (an !== bn) return an - bn;
      return a.name.localeCompare(b.name, "de");
    });
  }, [players, role, status, position, sort, query]);

  function toggle(player: PlayerRecord) {
    setPendingId(player.id);
    startTransition(async () => {
      await setPlayerActive(player.id, !player.active);
      setPendingId(null);
      router.refresh();
    });
  }

  return (
    <div className="mt-8 space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name suchen"
          className="w-full rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--fb-accent)] lg:max-w-xs"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sortierung">
          {(
            [
              ["number", "Nummer"],
              ["name", "Name"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={cn(
                "rounded-[var(--fb-radius)] px-3 py-1.5 text-sm font-semibold",
                sort === key
                  ? "bg-[var(--fb-green-950)] text-white"
                  : "bg-white text-[var(--fb-text-muted)] ring-1 ring-[var(--fb-border)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Rolle">
        {roleFilters.map((item) => (
          <FilterChip
            key={item.key}
            active={role === item.key}
            onClick={() => setRole(item.key)}
            label={item.label}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Status">
        {statusFilters.map((item) => (
          <FilterChip
            key={item.key}
            active={status === item.key}
            onClick={() => setStatus(item.key)}
            label={item.label}
          />
        ))}
        {role === "spielerin"
          ? positionFilters.map((item) => (
              <FilterChip
                key={item.key}
                active={position === item.key}
                onClick={() => setPosition(item.key)}
                label={item.label}
              />
            ))
          : null}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-[var(--fb-radius-lg)] border border-dashed border-[var(--fb-border)] bg-white p-6 text-sm text-[var(--fb-text-muted)]">
          Keine Einträge für diesen Filter.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((player) => (
            <li key={player.id}>
              <article
                className={cn(
                  "overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white",
                  !player.active && "opacity-90",
                )}
              >
                <Link href={`/admin/team/${player.id}`} className="block">
                  <div className="relative aspect-[3/4] bg-[var(--fb-green-900)]">
                    {player.photo ? (
                      <Image
                        src={player.photo}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className={cn("object-cover object-top", !player.active && "grayscale")}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    {player.number != null ? (
                      <span className="absolute right-3 top-3 font-[family-name:var(--fb-font-display)] text-4xl font-black text-white/30">
                        {player.number}
                      </span>
                    ) : null}
                    {!player.active ? (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--fb-ink)]">
                        Nicht im Kader
                      </span>
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fb-green-300)]">
                        {player.positionLabel || player.position}
                      </p>
                      <h2 className="mt-1 font-[family-name:var(--fb-font-display)] text-lg font-extrabold uppercase leading-none">
                        {player.name}
                      </h2>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={player.active}
                    aria-label={player.active ? `${player.name} auf inaktiv setzen` : `${player.name} aktivieren`}
                    disabled={pendingId === player.id}
                    onClick={() => toggle(player)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide disabled:opacity-60",
                      player.active
                        ? "bg-[var(--fb-green-100)] text-[var(--fb-accent)]"
                        : "bg-[var(--fb-soft)] text-[var(--fb-muted)]",
                    )}
                  >
                    {player.active ? "Aktiv" : "Inaktiv"}
                  </button>
                  <Link
                    href={`/admin/team/${player.id}`}
                    className="text-xs font-semibold text-[var(--fb-accent)] hover:underline"
                  >
                    Bearbeiten
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-[var(--fb-radius)] px-3 py-1.5 text-sm font-semibold",
        active
          ? "bg-[var(--fb-green-950)] text-white"
          : "bg-white text-[var(--fb-text-muted)] ring-1 ring-[var(--fb-border)]",
      )}
    >
      {label}
    </button>
  );
}
