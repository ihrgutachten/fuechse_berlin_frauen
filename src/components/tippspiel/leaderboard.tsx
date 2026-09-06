import { cn } from "@/lib/format";
import type { LeaderboardRow, SeasonRow } from "@/lib/tippspiel-db";

export function MatchLeaderboard({
  rows,
  showScores,
  showPoints,
}: {
  rows: LeaderboardRow[];
  showScores: boolean;
  showPoints: boolean;
}) {
  if (!rows.length) {
    return (
      <p className="text-sm text-[var(--fb-text-muted)]">
        Noch keine Tipps. Sei die erste Stimme im Revier.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-[var(--fb-border)]">
      {rows.map((row) => (
        <li
          key={row.userId}
          className={cn(
            "flex items-center gap-3 py-2.5 text-sm",
            row.isYou && "rounded-[var(--fb-radius)] bg-[var(--fb-green-100)] px-2",
          )}
        >
          <span className="w-7 font-[family-name:var(--fb-font-display)] font-bold tabular-nums text-[var(--fb-text-faint)]">
            {row.rank}.
          </span>
          <span className="min-w-0 flex-1 truncate font-semibold text-[var(--fb-ink)]">
            {row.nickname}
            {row.isYou ? (
              <span className="ml-2 text-xs font-bold uppercase tracking-wider text-[var(--fb-accent)]">
                Du
              </span>
            ) : null}
          </span>
          {showScores && row.homeScore != null && row.awayScore != null ? (
            <span className="tabular-nums text-[var(--fb-text-muted)]">
              {row.homeScore}:{row.awayScore}
            </span>
          ) : null}
          {showPoints ? (
            <span className="w-10 text-right font-[family-name:var(--fb-font-display)] font-bold tabular-nums text-[var(--fb-accent)]">
              {row.points}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function SeasonLeaderboard({ rows }: { rows: SeasonRow[] }) {
  if (!rows.length) {
    return (
      <p className="text-sm text-[var(--fb-text-muted)]">
        Die Saisonwertung startet mit dem ersten abgerechneten Spiel.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-[var(--fb-border)]">
      {rows.map((row) => (
        <li
          key={row.userId}
          className={cn(
            "flex items-center gap-3 py-2.5 text-sm",
            row.isYou && "rounded-[var(--fb-radius)] bg-[var(--fb-green-100)] px-2",
          )}
        >
          <span className="w-7 font-[family-name:var(--fb-font-display)] font-bold tabular-nums text-[var(--fb-text-faint)]">
            {row.rank}.
          </span>
          <span className="min-w-0 flex-1 truncate font-semibold text-[var(--fb-ink)]">
            {row.nickname}
            {row.isYou ? (
              <span className="ml-2 text-xs font-bold uppercase tracking-wider text-[var(--fb-accent)]">
                Du
              </span>
            ) : null}
          </span>
          <span className="text-xs text-[var(--fb-text-faint)]">
            {row.exact} exakt · {row.tipped} Tipps
          </span>
          <span className="w-10 text-right font-[family-name:var(--fb-font-display)] font-bold tabular-nums text-[var(--fb-accent)]">
            {row.points}
          </span>
        </li>
      ))}
    </ol>
  );
}
