import { tipCardClass } from "@/components/tippspiel/card";
import type { Match } from "@/lib/data";
import { formatMatchDate } from "@/lib/format";
import type { LeaderboardRow, SeasonRow } from "@/lib/tippspiel-db";

export function WeeklyWinnerCard({
  match,
  winner,
  yourTip,
}: {
  match: Match;
  winner?: Pick<LeaderboardRow, "nickname" | "points" | "homeScore" | "awayScore"> | null;
  yourTip?: string | null;
}) {
  return (
    <section className={`${tipCardClass} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fb-accent)]">
        Letzte Woche
      </p>
      <h2 className="mt-1 font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase">
        {match.home.short} vs {match.away.short}{" "}
        {match.homeScore}:{match.awayScore}
      </h2>
      <p className="mt-1 text-sm text-[var(--fb-text-muted)]">{formatMatchDate(match.startsAt)}</p>
      {winner ? (
        <p className="mt-3 text-base text-[var(--fb-ink)]">
          Gewinnerin:{" "}
          <strong className="font-[family-name:var(--fb-font-display)] text-lg font-extrabold uppercase">
            {winner.nickname}
          </strong>
          {winner.homeScore != null && winner.awayScore != null ? (
            <span className="text-sm font-normal text-[var(--fb-text-muted)]">
              {" "}
              · Tipp {winner.homeScore}:{winner.awayScore} · {winner.points}{" "}
              {winner.points === 1 ? "Punkt" : "Punkte"}
            </span>
          ) : null}
        </p>
      ) : (
        <p className="mt-3 text-sm text-[var(--fb-text-muted)]">
          Noch keine Gewinnerin. Das Tippspiel startet mit dem aktuellen Spieltag.
        </p>
      )}
      {yourTip ? <p className="mt-1 text-sm text-[var(--fb-text-muted)]">{yourTip}</p> : null}
    </section>
  );
}

export function SeasonPodium({ rows }: { rows: SeasonRow[] }) {
  const top = rows.slice(0, 3);

  return (
    <section className={`${tipCardClass} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fb-accent)]">
        Saison
      </p>
      <h2 className="mt-1 font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase leading-none">
        Top 3
      </h2>
      {top.length ? (
        <ol className="mt-3 space-y-2">
          {top.map((row) => (
            <li key={row.userId} className="flex items-baseline gap-3 text-sm">
              <span className="w-6 font-[family-name:var(--fb-font-display)] font-bold tabular-nums text-[var(--fb-text-faint)]">
                {row.rank}.
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold text-[var(--fb-ink)]">
                {row.nickname}
              </span>
              <span className="font-[family-name:var(--fb-font-display)] font-bold tabular-nums text-[var(--fb-accent)]">
                {row.points}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-[var(--fb-text-muted)]">
          Die Saisonwertung startet mit dem ersten abgerechneten Spiel.
        </p>
      )}
    </section>
  );
}
