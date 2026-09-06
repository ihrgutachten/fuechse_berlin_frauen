"use client";

import { useState } from "react";
import { MatchLineup } from "@/components/match/match-lineup";
import { MatchReportStats } from "@/components/match/match-report-stats";
import { Button } from "@/components/ui/button";
import type { Match } from "@/lib/data";
import type { MatchReport } from "@/lib/parse-press-report";
import { formatMatchDate, cn } from "@/lib/format";

type Tab = "aufstellung" | "statistik" | "liveticker";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "aufstellung", label: "Aufstellung" },
  { id: "statistik", label: "Spielstatistik" },
  { id: "liveticker", label: "Liveticker" },
];

export function MatchdayModules({
  nextMatchId,
  reportMatch,
  report,
  pdfUrl,
}: {
  nextMatchId?: string;
  reportMatch: Match;
  report: MatchReport | null;
  pdfUrl: string;
}) {
  const [tab, setTab] = useState<Tab>("aufstellung");
  const isLastGame = nextMatchId !== reportMatch.id;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fb-accent)]">
            {isLastGame ? "Letztes Spiel" : "Spielbericht"}
          </p>
          <h3 className="mt-1 font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase">
            {reportMatch.home.short} vs {reportMatch.away.short}
          </h3>
          <p className="text-sm text-[var(--fb-text-muted)]">
            {formatMatchDate(reportMatch.startsAt)}
            {reportMatch.homeScore != null && reportMatch.awayScore != null
              ? ` · ${reportMatch.homeScore}:${reportMatch.awayScore}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href={`/spielplan/${reportMatch.id}`} variant="outline">
            Spielbericht
          </Button>
          <Button href={pdfUrl} variant="ghost">
            PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Matchday-Module">
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
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

      {tab === "aufstellung" ? (
        report ? (
          <MatchLineup ourTeam={report.ourTeam} opponent={report.opponent} />
        ) : (
          <EmptyModule text="Aufstellung folgt, sobald der offizielle Spielbericht vorliegt." />
        )
      ) : null}

      {tab === "statistik" ? (
        report ? (
          <MatchReportStats match={reportMatch} report={report} />
        ) : (
          <EmptyModule text="Statistik folgt nach Abpfiff aus dem Ligaspielbericht." />
        )
      ) : null}

      {tab === "liveticker" ? (
        <EmptyModule text="Liveticker kommt in Phase 2. Bis dahin der Spielbericht der Liga." />
      ) : null}
    </section>
  );
}

function EmptyModule({ text }: { text: string }) {
  return (
    <div className="rounded-[var(--fb-radius-lg)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] p-5">
      <p className="text-sm text-[var(--fb-text-muted)]">{text}</p>
    </div>
  );
}
