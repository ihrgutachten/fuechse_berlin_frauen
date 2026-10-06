import type { MatchTipper } from "@/lib/tippspiel-db";

export function TipperList({ rows }: { rows: MatchTipper[] }) {
  if (!rows.length) {
    return <p className="text-sm text-[var(--fb-text-muted)]">Noch keine Tipps.</p>;
  }

  return (
    <ul className="divide-y divide-[var(--fb-border)]">
      {rows.map((row) => (
        <li
          key={row.userId}
          className="flex flex-col gap-0.5 py-2.5 text-sm sm:flex-row sm:items-center sm:gap-4"
        >
          <span className="min-w-0 font-semibold text-[var(--fb-ink)] sm:w-40 sm:shrink-0 sm:truncate">
            {row.nickname}
          </span>
          <span className="min-w-0 flex-1 truncate text-[var(--fb-text-muted)]">
            {row.email ?? "keine E-Mail"}
          </span>
          <span className="font-[family-name:var(--fb-font-display)] font-bold tabular-nums text-[var(--fb-ink)]">
            {row.homeScore}:{row.awayScore}
          </span>
        </li>
      ))}
    </ul>
  );
}
