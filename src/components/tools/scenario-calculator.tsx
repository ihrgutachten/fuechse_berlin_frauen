"use client";

import { useEffect, useMemo, useState } from "react";
import { ClubLogo } from "@/components/match/club-logo";
import type { StandingRow } from "@/lib/data";
import { cn } from "@/lib/format";
import {
  applyScenario,
  fuechseHeadline,
  involvesUs,
  isCompleteScore,
  SCENARIO_MAX_GOALS,
  tableZone,
  type ScenarioFixture,
  type ScenarioStanding,
  type ScenarioTips,
  type TableZone,
} from "@/lib/scenario";

type Filter = "all" | "fuechse";
type ScoreDraft = { home: number | null; away: number | null };
type DraftTips = Record<string, ScoreDraft>;

const STORAGE_KEY = "fb-scenario-scores";

const ZONE_BAR: Record<Exclude<TableZone, null>, string> = {
  up: "bg-[var(--fb-green-500)]",
  playoff: "bg-[#2b6cb0]",
  down: "bg-[var(--fb-red)]",
};

function parseGoal(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < 0 || value > SCENARIO_MAX_GOALS) return null;
  return value;
}

function completeTips(drafts: DraftTips): ScenarioTips {
  const tips: ScenarioTips = {};
  for (const [id, draft] of Object.entries(drafts)) {
    if (!isCompleteScore(draft)) continue;
    tips[id] = { home: draft.home, away: draft.away };
  }
  return tips;
}

function readStoredTips(ids: Set<string>): DraftTips {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const tips: DraftTips = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (!ids.has(id) || !value || typeof value !== "object") continue;
      const row = value as { home?: unknown; away?: unknown };
      const home = parseGoal(row.home);
      const away = parseGoal(row.away);
      if (home == null && away == null) continue;
      tips[id] = { home, away };
    }
    return tips;
  } catch {
    return {};
  }
}

function soonestMatchday(list: ScenarioFixture[]): number | null {
  if (list.length === 0) return null;
  return list.reduce((best, fixture) =>
    +new Date(fixture.startsAt) < +new Date(best.startsAt) ? fixture : best,
  ).matchday;
}

function dayIndexFor(days: Array<{ matchday: number }>, matchday: number | null): number {
  if (matchday == null || days.length === 0) return 0;
  const index = days.findIndex((day) => day.matchday === matchday);
  return index >= 0 ? index : 0;
}

export function ScenarioCalculator({
  standings,
  fixtures,
}: {
  standings: StandingRow[];
  fixtures: ScenarioFixture[];
}) {
  const fixtureIds = useMemo(() => new Set(fixtures.map((fixture) => fixture.id)), [fixtures]);
  const [drafts, setDrafts] = useState<DraftTips>({});
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [dayIndex, setDayIndex] = useState<number | null>(null);

  useEffect(() => {
    setDrafts(readStoredTips(fixtureIds));
    setHydrated(true);
  }, [fixtureIds]);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  }, [hydrated, drafts]);

  const visible = useMemo(
    () => (filter === "fuechse" ? fixtures.filter(involvesUs) : fixtures),
    [filter, fixtures],
  );

  const days = useMemo(() => {
    const map = new Map<number, ScenarioFixture[]>();
    for (const fixture of visible) {
      const list = map.get(fixture.matchday) ?? [];
      list.push(fixture);
      map.set(fixture.matchday, list);
    }
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([matchday, matches]) => ({
        matchday,
        matches: [...matches].sort(
          (a, b) => +new Date(a.startsAt) - +new Date(b.startsAt),
        ),
      }));
  }, [visible]);

  const resolvedDayIndex = Math.min(
    dayIndex ?? dayIndexFor(days, soonestMatchday(visible)),
    Math.max(0, days.length - 1),
  );

  const currentDay = days[resolvedDayIndex];
  const tips = useMemo(() => completeTips(drafts), [drafts]);
  const rows = useMemo(
    () => applyScenario(standings, fixtures, tips),
    [fixtures, standings, tips],
  );
  const tipCount = Object.keys(tips).length;
  const headline = fuechseHeadline(rows, tipCount);

  function setGoal(id: string, side: "home" | "away", value: number | null) {
    setDrafts((prev) => {
      const current = prev[id] ?? { home: null, away: null };
      const next = { ...current, [side]: value };
      if (next.home == null && next.away == null) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  }

  function clearGoal(id: string) {
    setDrafts((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Spiele filtern">
          {(
            [
              ["all", "Alle Spiele"],
              ["fuechse", "Nur Füchse"],
            ] as const
          ).map(([key, label]) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setFilter(key);
                  setDayIndex(null);
                }}
                className={cn(
                  "rounded-[var(--fb-radius)] px-3 py-1.5 text-sm font-semibold transition",
                  active
                    ? "bg-[var(--fb-green-950)] text-white"
                    : "bg-[var(--fb-soft)] text-[var(--fb-text-muted)] hover:bg-[var(--fb-soft-2)]",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        {tipCount > 0 ? (
          <button
            type="button"
            onClick={() => setDrafts({})}
            className="inline-flex items-center gap-2 self-start rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--fb-ink)] hover:border-[var(--fb-accent)]"
          >
            Meine Ergebnisse ({tipCount})
            <span aria-hidden>✕</span>
            <span className="sr-only">Alle Ergebnisse löschen</span>
          </button>
        ) : (
          <p className="text-sm text-[var(--fb-text-muted)]">Noch keine Ergebnisse</p>
        )}
      </div>

      <p className="rounded-[var(--fb-radius)] border border-[var(--fb-home-line)] bg-[var(--fb-home-soft)] px-4 py-3 text-sm font-medium text-[var(--fb-green-900)]">
        {headline}
      </p>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white">
          <div className="border-b border-[var(--fb-border)] px-4 py-4 md:px-5">
            <h2 className="font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase">
              Spielplan
            </h2>
            <p className="mt-1 text-sm text-[var(--fb-text-muted)]">
              Tore für Heim und Gast eintragen. Punkte, Tore und Tordifferenz laufen in die Tabelle.
            </p>
          </div>

          {currentDay ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-[var(--fb-border)] px-4 py-3 md:px-5">
                <button
                  type="button"
                  disabled={resolvedDayIndex === 0}
                  onClick={() => setDayIndex(Math.max(0, resolvedDayIndex - 1))}
                  className="text-sm font-semibold text-[var(--fb-accent)] disabled:text-[var(--fb-text-faint)]"
                >
                  Vorheriger
                </button>
                <p className="text-sm font-semibold text-[var(--fb-ink)]">
                  {currentDay.matchday > 0
                    ? `${currentDay.matchday}. Spieltag`
                    : "Ohne Spieltag"}
                </p>
                <button
                  type="button"
                  disabled={resolvedDayIndex >= days.length - 1}
                  onClick={() => setDayIndex(Math.min(days.length - 1, resolvedDayIndex + 1))}
                  className="text-sm font-semibold text-[var(--fb-accent)] disabled:text-[var(--fb-text-faint)]"
                >
                  Nächster
                </button>
              </div>
              <ul>
                {currentDay.matches.map((fixture) => (
                  <FixtureRow
                    key={fixture.id}
                    fixture={fixture}
                    draft={drafts[fixture.id]}
                    onGoal={(side, value) => setGoal(fixture.id, side, value)}
                    onClear={() => clearGoal(fixture.id)}
                  />
                ))}
              </ul>
            </>
          ) : (
            <p className="px-4 py-8 text-sm text-[var(--fb-text-muted)] md:px-5">
              Keine offenen Ligaspiele in diesem Filter.
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white">
          <div className="border-b border-[var(--fb-border)] px-4 py-4 md:px-5">
            <h2 className="font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase">
              Tabelle
            </h2>
            <p className="mt-1 text-sm text-[var(--fb-text-muted)]">
              Zwei Punkte für einen Sieg, einer für ein Unentschieden. Bei Gleichstand zählt die
              Tordifferenz.
            </p>
          </div>
          <ScenarioTable rows={rows} />
          <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--fb-border)] bg-[var(--fb-soft)] px-4 py-3 text-xs text-[var(--fb-text-muted)] md:px-5">
            <li className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[var(--fb-green-500)]" />
              Platz 1 Aufstieg
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#2b6cb0]" />
              Platz 2 Relegation
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[var(--fb-red)]" />
              Platz 15-16 Abstieg
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function FixtureRow({
  fixture,
  draft,
  onGoal,
  onClear,
}: {
  fixture: ScenarioFixture;
  draft?: ScoreDraft;
  onGoal: (side: "home" | "away", value: number | null) => void;
  onClear: () => void;
}) {
  const ours = involvesUs(fixture);
  const complete = isCompleteScore(draft ?? {});

  return (
    <li
      className={cn(
        "flex flex-col gap-3 border-t border-[var(--fb-border)] px-4 py-3 sm:flex-row sm:items-center sm:gap-4 md:px-5",
        ours && "bg-[var(--fb-home-soft)]",
      )}
    >
      <p className="w-24 shrink-0 text-xs leading-tight text-[var(--fb-text-muted)]">
        <span className="block tabular-nums">{fixture.dayLabel}</span>
        <span className="tabular-nums">{fixture.timeLabel} Uhr</span>
      </p>
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <TeamBadge team={fixture.home} align="right" />
        <div className="flex shrink-0 items-center gap-1.5">
          <GoalField
            label={`Tore ${fixture.home.short}`}
            value={draft?.home ?? null}
            onChange={(value) => onGoal("home", value)}
          />
          <span className="font-[family-name:var(--fb-font-display)] text-lg font-extrabold text-[var(--fb-text-faint)]">
            :
          </span>
          <GoalField
            label={`Tore ${fixture.away.short}`}
            value={draft?.away ?? null}
            onChange={(value) => onGoal("away", value)}
          />
        </div>
        <TeamBadge team={fixture.away} align="left" />
      </div>
      {complete ? (
        <button
          type="button"
          onClick={onClear}
          className="self-start text-xs font-semibold text-[var(--fb-text-muted)] hover:text-[var(--fb-accent)] sm:self-center"
        >
          Löschen
        </button>
      ) : (
        <span className="hidden w-12 sm:block" aria-hidden />
      )}
    </li>
  );
}

function GoalField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      aria-label={label}
      placeholder=""
      value={value == null ? "" : String(value)}
      onChange={(event) => {
        const raw = event.target.value.trim();
        if (raw === "") {
          onChange(null);
          return;
        }
        if (!/^\d{1,2}$/.test(raw)) return;
        const next = Number(raw);
        if (next > SCENARIO_MAX_GOALS) return;
        onChange(next);
      }}
      className="h-9 w-12 rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white text-center font-[family-name:var(--fb-font-display)] text-lg font-extrabold tabular-nums text-[var(--fb-ink)] outline-none placeholder:text-[var(--fb-text-faint)] focus:border-[var(--fb-accent)]"
    />
  );
}

function TeamBadge({
  team,
  align,
}: {
  team: ScenarioFixture["home"];
  align: "left" | "right";
}) {
  return (
    <span
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2",
        align === "right" && "justify-end text-right",
      )}
    >
      {align === "left" ? (
        <ClubLogo name={team.name} short={team.short} logo={team.logo} hasLogo={team.hasLogo} size="xs" />
      ) : null}
      <span className="truncate text-sm font-semibold text-[var(--fb-ink)]">{team.short}</span>
      {align === "right" ? (
        <ClubLogo name={team.name} short={team.short} logo={team.logo} hasLogo={team.hasLogo} size="xs" />
      ) : null}
    </span>
  );
}

function ScenarioTable({ rows }: { rows: ScenarioStanding[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-sm">
        <thead className="bg-[var(--fb-green-950)] text-left text-[11px] uppercase tracking-[0.08em] text-white/70">
          <tr>
            <th className="px-2 py-3 font-medium">#</th>
            <th className="px-2 py-3 font-medium">Klub</th>
            <th className="px-2 py-3 text-right font-medium">Sp</th>
            <th className="px-2 py-3 text-right font-medium">S</th>
            <th className="px-2 py-3 text-right font-medium">U</th>
            <th className="px-2 py-3 text-right font-medium">N</th>
            <th className="px-2 py-3 text-right font-medium">Tore</th>
            <th className="px-2 py-3 text-right font-medium">+/-</th>
            <th className="px-2 py-3 text-right font-medium">Pkt</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const zone = tableZone(row.rank);
            const diff = row.goalsFor - row.goalsAgainst;
            return (
              <tr
                key={row.teamSlug}
                className={cn(
                  "border-t border-[var(--fb-border)]",
                  row.isUs
                    ? "bg-[var(--fb-green-100)] font-semibold text-[var(--fb-green-900)]"
                    : "bg-white",
                )}
              >
                <td className="relative px-2 py-2.5 tabular-nums">
                  {zone ? (
                    <span
                      aria-hidden
                      className={cn("absolute inset-y-0 left-0 w-1", ZONE_BAR[zone])}
                    />
                  ) : null}
                  {row.rank}
                </td>
                <td className="px-2 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <ClubLogo
                      name={row.team}
                      short={row.short}
                      logo={row.logo}
                      hasLogo={row.hasLogo}
                      size="xs"
                    />
                    <span>{row.short}</span>
                  </span>
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums">{row.played}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{row.won}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{row.draw}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{row.lost}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">
                  {row.goalsFor}:{row.goalsAgainst}
                </td>
                <td
                  className={cn(
                    "px-2 py-2.5 text-right tabular-nums",
                    diff > 0 && "text-[var(--fb-green-600)]",
                    diff < 0 && "text-[var(--fb-red)]",
                  )}
                >
                  {diff > 0 ? `+${diff}` : diff}
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
