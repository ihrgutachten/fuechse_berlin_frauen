"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import type { SquadStatRow } from "@/lib/squad-stats";
import { cn } from "@/lib/format";

type Category = "goals" | "seven" | "assists" | "penalties" | "saves";

const categories: { key: Category; label: string }[] = [
  { key: "goals", label: "Tore" },
  { key: "seven", label: "7-Meter" },
  { key: "assists", label: "Assists" },
  { key: "penalties", label: "Zeitstrafen" },
  { key: "saves", label: "Paraden" },
];

type Entry = {
  row: SquadStatRow;
  amount: number;
  text: string;
  unit: string;
};

function gamesLabel(games: number): string {
  return games === 1 ? "1 Spiel" : `${games} Spiele`;
}

function formatSeven(goals: number, attempts: number): string {
  if (goals === 0 && attempts === 0) return "0";
  return `${goals}/${attempts}`;
}

function entriesFor(rows: SquadStatRow[], category: Category): Entry[] {
  const byName = (a: SquadStatRow, b: SquadStatRow) => a.name.localeCompare(b.name, "de");
  if (category === "goals") {
    return rows
      .filter((row) => row.goals > 0)
      .sort((a, b) => b.goals - a.goals || byName(a, b))
      .map((row) => ({ row, amount: row.goals, text: String(row.goals), unit: "Tore" }));
  }
  if (category === "seven") {
    return rows
      .filter((row) => row.sevenMeterAttempts > 0)
      .sort((a, b) => b.sevenMeterGoals - a.sevenMeterGoals || b.sevenMeterAttempts - a.sevenMeterAttempts || byName(a, b))
      .map((row) => ({
        row,
        amount: row.sevenMeterGoals,
        text: formatSeven(row.sevenMeterGoals, row.sevenMeterAttempts),
        unit: "7-Meter",
      }));
  }
  if (category === "assists") {
    return rows
      .filter((row) => row.assists > 0)
      .sort((a, b) => b.assists - a.assists || byName(a, b))
      .map((row) => ({ row, amount: row.assists, text: String(row.assists), unit: "Assists" }));
  }
  if (category === "penalties") {
    return rows
      .filter((row) => row.twoMinutePenalties > 0)
      .sort((a, b) => b.twoMinutePenalties - a.twoMinutePenalties || byName(a, b))
      .map((row) => ({
        row,
        amount: row.twoMinutePenalties,
        text: String(row.twoMinutePenalties),
        unit: "Zeitstrafen",
      }));
  }
  return rows
    .filter((row) => row.position === "goalkeeper" && row.saves > 0)
    .sort((a, b) => b.saves - a.saves || byName(a, b))
    .map((row) => ({ row, amount: row.saves, text: String(row.saves), unit: "Paraden" }));
}

function Avatar({ row, size }: { row: SquadStatRow; size: "lg" | "sm" }) {
  const box = size === "lg" ? "h-20 w-20 md:h-24 md:w-24" : "h-9 w-9";
  if (row.photo) {
    return (
      <Image
        src={row.photo}
        alt=""
        width={size === "lg" ? 96 : 36}
        height={size === "lg" ? 96 : 36}
        className={cn(box, "shrink-0 rounded-full object-cover object-top")}
      />
    );
  }
  return <span className={cn(box, "shrink-0 rounded-full bg-[var(--fb-soft)]")} />;
}

function PlayerLink({ row, className, children }: { row: SquadStatRow; className?: string; children: ReactNode }) {
  if (!row.slug) return <span className={className}>{children}</span>;
  return (
    <Link href={`/team/${row.slug}`} className={cn("underline-offset-2 hover:underline", className)}>
      {children}
    </Link>
  );
}

function metaLine(row: SquadStatRow): string {
  const bits = [row.number != null ? String(row.number) : "", row.positionLabel].filter(Boolean);
  return bits.join(" · ");
}

function Bar({ amount, max }: { amount: number; max: number }) {
  const width = max > 0 && amount > 0 ? Math.max(4, Math.round((amount / max) * 100)) : 0;
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--fb-soft-2)]">
      <div className="h-full rounded-full bg-[var(--fb-green-500)]" style={{ width: `${width}%` }} />
    </div>
  );
}

function Leader({ entry }: { entry: Entry }) {
  const { row } = entry;
  return (
    <div className="flex items-center gap-4 bg-[var(--fb-green-950)] px-4 py-5 text-white md:px-6">
      <Avatar row={row} size="lg" />
      <div className="min-w-0">
        <p className="font-[family-name:var(--fb-font-display)] text-4xl font-black leading-none md:text-5xl">
          {entry.text}
          <span className="ml-2 align-middle text-sm font-semibold uppercase tracking-[0.12em] text-white/70">
            {entry.unit}
          </span>
        </p>
        <p className="mt-2 truncate text-lg font-semibold">
          <PlayerLink row={row} className="text-white">
            {row.name}
          </PlayerLink>
        </p>
        <p className="text-sm text-white/65">
          {metaLine(row)}
          {metaLine(row) ? " · " : ""}
          {gamesLabel(row.games)}
        </p>
      </div>
    </div>
  );
}

function Ranking({ entries, note }: { entries: Entry[]; note?: string }) {
  const [lead, ...rest] = entries;
  if (!lead) {
    return <p className="text-[var(--fb-text-muted)]">In dieser Wertung ist noch niemand geführt.</p>;
  }
  const max = lead.amount;
  return (
    <article className="overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white">
      <Leader entry={lead} />
      {note ? <p className="border-t border-white/10 bg-[var(--fb-green-950)] px-4 pb-4 text-xs text-white/60 md:px-6">{note}</p> : null}
      {rest.length > 0 ? (
        <ol>
          {rest.map((entry, index) => (
            <li key={entry.row.name} className="border-t border-[var(--fb-border)] px-4 py-3 md:px-5">
              <div className="flex items-center gap-3">
                <span className="w-5 text-sm font-semibold tabular-nums text-[var(--fb-text-faint)]">{index + 2}</span>
                <Avatar row={entry.row} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <PlayerLink row={entry.row} className="truncate font-semibold text-[var(--fb-ink)]">
                      {entry.row.name}
                    </PlayerLink>
                    <span className="shrink-0 font-semibold tabular-nums">{entry.text}</span>
                  </div>
                  <p className="text-xs text-[var(--fb-text-muted)]">{metaLine(entry.row)}</p>
                  <div className="mt-2">
                    <Bar amount={entry.amount} max={max} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </article>
  );
}

function KeeperCards({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="text-[var(--fb-text-muted)]">In dieser Wertung ist noch niemand geführt.</p>;
  }
  const max = entries[0].amount;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {entries.map((entry) => (
        <article
          key={entry.row.name}
          className="overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white"
        >
          <Leader entry={entry} />
          <div className="px-4 py-4 md:px-6">
            <Bar amount={entry.amount} max={max} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function SquadStatsBrowser({ rows }: { rows: SquadStatRow[] }) {
  const [category, setCategory] = useState<Category>("goals");
  const entries = useMemo(() => entriesFor(rows, category), [rows, category]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Wertung">
        {categories.map((item) => {
          const active = item.key === category;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(item.key)}
              className={cn(
                "rounded-[var(--fb-radius)] px-3 py-1.5 text-sm font-semibold transition",
                active
                  ? "bg-[var(--fb-green-950)] text-white"
                  : "bg-[var(--fb-soft)] text-[var(--fb-text-muted)] hover:bg-[var(--fb-soft-2)]",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {category === "saves" ? (
        <KeeperCards entries={entries} />
      ) : (
        <Ranking entries={entries} note={category === "seven" ? "Verwandelt / versucht." : undefined} />
      )}
    </div>
  );
}
