import Link from "next/link";
import type { StandingRow } from "@/lib/data";
import { cn } from "@/lib/format";

type StandingsPreviewProps = {
  rows: StandingRow[];
  limit?: number;
};

export function StandingsPreview({ rows, limit = 6 }: StandingsPreviewProps) {
  const visible = rows.slice(0, limit);

  return (
    <div className="overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-sm">
          <thead className="bg-[var(--fb-green-950)] text-left text-xs uppercase tracking-[0.1em] text-white/70">
            <tr>
              <th className="px-3 py-3 font-medium">#</th>
              <th className="px-3 py-3 font-medium">Team</th>
              <th className="px-3 py-3 text-right font-medium">Sp</th>
              <th className="px-3 py-3 text-right font-medium">Tore</th>
              <th className="px-3 py-3 text-right font-medium">Pkt</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row.team}
                className={cn(
                  "border-t border-[var(--fb-border)]",
                  row.isUs
                    ? "bg-[var(--fb-green-100)] font-semibold text-[var(--fb-green-900)]"
                    : "bg-white",
                )}
              >
                <td className="px-3 py-3 tabular-nums">{row.rank}</td>
                <td className="px-3 py-3">{row.team}</td>
                <td className="px-3 py-3 text-right tabular-nums">{row.played}</td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {row.goalsFor}:{row.goalsAgainst}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{row.points}</td>
              </tr>
            ))}
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
