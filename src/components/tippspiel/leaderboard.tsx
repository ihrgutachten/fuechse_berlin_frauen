import { cn } from "@/lib/format";
import type { LeaderboardRow, SeasonRow } from "@/lib/tippspiel-db";

function NameWithEmail({
  nickname,
  email,
  isYou,
  showEmail,
}: {
  nickname: string;
  email: string | null;
  isYou: boolean;
  showEmail: boolean;
}) {
  return (
    <span className="min-w-0 flex-1">
      <span className="font-semibold text-[var(--fb-ink)]">{nickname}</span>
      {isYou ? (
        <span className="ml-2 text-xs font-bold uppercase tracking-wider text-[var(--fb-accent)]">
          Du
        </span>
      ) : null}
      {showEmail && email ? (
        <span className="mt-0.5 block truncate text-xs font-normal text-[var(--fb-text-muted)]">
          {email}
        </span>
      ) : null}
    </span>
  );
}

export function MatchLeaderboard({
  rows,
  showScores,
  showPoints,
  showEmail = false,
}: {
  rows: LeaderboardRow[];
  showScores: boolean;
  showPoints: boolean;
  showEmail?: boolean;
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
          <NameWithEmail
            nickname={row.nickname}
            email={row.email}
            isYou={row.isYou}
            showEmail={showEmail}
          />
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

export function SeasonLeaderboard({
  rows,
  showEmail = false,
}: {
  rows: SeasonRow[];
  showEmail?: boolean;
}) {
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
          <NameWithEmail
            nickname={row.nickname}
            email={row.email}
            isYou={row.isYou}
            showEmail={showEmail}
          />
          <span className="shrink-0 text-xs text-[var(--fb-text-faint)]">
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
