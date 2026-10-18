import Link from "next/link";
import { ClubLogo } from "@/components/match/club-logo";
import type { StandingRow } from "@/lib/data";
import { cn } from "@/lib/format";

type StandingsPreviewProps = {
  rows: StandingRow[];
  limit?: number;
};

function formatDiff(goalsFor: number, goalsAgainst: number): { text: string; tone: "plus" | "minus" | "even" } {
  const diff = goalsFor - goalsAgainst;
  if (diff > 0) return { text: `+${diff}`, tone: "plus" };
  if (diff < 0) return { text: String(diff), tone: "minus" };
  return { text: "0", tone: "even" };
}

function ColumnHead({
  label,
  hint,
  align = "right",
  tip = "center",
}: {
  label: string;
  hint: string;
  align?: "left" | "right";
  tip?: "start" | "center" | "end";
}) {
  return (
    <th className={cn("group relative px-2 py-3 font-medium", align === "right" ? "text-right" : "text-left")}>
      <span className="cursor-help border-b border-dotted border-white/35">{label}</span>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute top-full z-30 mt-1.5 hidden w-max max-w-52 rounded-[var(--fb-radius)] bg-white px-2.5 py-1.5 text-left text-xs font-semibold normal-case tracking-normal text-[var(--fb-green-950)] shadow-md group-hover:block",
          tip === "start" && "left-0",
          tip === "center" && "left-1/2 -translate-x-1/2",
          tip === "end" && "right-0",
        )}
      >
        {hint}
      </span>
    </th>
  );
}

export function StandingsPreview({ rows, limit = 6 }: StandingsPreviewProps) {
  const visible = rows.slice(0, limit);

  return (
    <div className="overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <thead className="relative z-10 bg-[var(--fb-green-950)] text-left text-xs uppercase tracking-[0.1em] text-white/70">
            <tr>
              <ColumnHead label="#" hint="Platz" align="left" tip="start" />
              <ColumnHead label="Team" hint="Mannschaft" align="left" tip="start" />
              <ColumnHead label="Sp" hint="Gespielte Spiele" />
              <ColumnHead label="S" hint="Siege" />
              <ColumnHead label="U" hint="Unentschieden" />
              <ColumnHead label="N" hint="Niederlagen" />
              <ColumnHead label="Tore" hint="Erzielte und gegnerische Tore" />
              <ColumnHead label="+/-" hint="Tordifferenz" />
              <ColumnHead label="Pkt" hint="Punkte" tip="end" />
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const diff = formatDiff(row.goalsFor, row.goalsAgainst);
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
                <td className="px-3 py-3 tabular-nums">{row.rank}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-2">
                    <ClubLogo
                      name={row.team}
                      short={row.short}
                      logo={row.logo}
                      hasLogo={row.hasLogo}
                      size="sm"
                    />
                    <span>{row.team}</span>
                  </span>
                </td>
                <td className="px-2 py-3 text-right tabular-nums">{row.played}</td>
                <td className="px-2 py-3 text-right tabular-nums">{row.won}</td>
                <td className="px-2 py-3 text-right tabular-nums">{row.draw}</td>
                <td className="px-2 py-3 text-right tabular-nums">{row.lost}</td>
                <td className="px-2 py-3 text-right tabular-nums">
                  {row.goalsFor}:{row.goalsAgainst}
                </td>
                <td
                  className={cn(
                    "px-2 py-3 text-right tabular-nums",
                    diff.tone === "plus" && "text-[var(--fb-green-600)]",
                    diff.tone === "minus" && "text-[var(--fb-red)]",
                  )}
                >
                  {diff.text}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{row.points}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-[var(--fb-border)] bg-[var(--fb-soft)] px-3 py-2 text-right">
        <Link href="/tabelle" className="text-sm font-semibold text-[var(--fb-accent)] hover:underline">
          Gesamte Tabelle
        </Link>
      </div>
    </div>
  );
}
