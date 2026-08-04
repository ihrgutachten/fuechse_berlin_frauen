import Link from "next/link";
import { Countdown } from "@/components/match/countdown";
import { Button } from "@/components/ui/button";
import type { Match } from "@/lib/data";
import { cn, formatMatchDate } from "@/lib/format";

type MatchCardProps = {
  match: Match;
  showCountdown?: boolean;
  className?: string;
};

export function MatchCard({ match, showCountdown = false, className }: MatchCardProps) {
  const finished = match.status === "finished";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-surface)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--fb-border)] bg-[var(--fb-soft)] px-4 py-2.5 text-xs uppercase tracking-[0.12em] text-[var(--fb-text-muted)]">
        <span>
          {match.isHome ? "Heim" : "Auswärts"} · Spieltag {match.matchday}
        </span>
        <span>{formatMatchDate(match.startsAt)}</span>
      </div>

      <div className="px-4 py-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="text-right">
            <p
              className={cn(
                "font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase leading-tight md:text-2xl",
                match.home.isUs && "text-[var(--fb-accent)]",
              )}
            >
              {match.home.short}
            </p>
            <p className="mt-1 text-xs text-[var(--fb-text-faint)]">{match.home.name}</p>
          </div>

          <div className="min-w-[4.5rem] text-center">
            {finished ? (
              <p className="font-[family-name:var(--fb-font-display)] text-3xl font-extrabold tabular-nums">
                {match.homeScore}:{match.awayScore}
              </p>
            ) : (
              <p className="font-[family-name:var(--fb-font-display)] text-lg font-bold text-[var(--fb-text-muted)]">
                VS
              </p>
            )}
          </div>

          <div>
            <p
              className={cn(
                "font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase leading-tight md:text-2xl",
                match.away.isUs && "text-[var(--fb-accent)]",
              )}
            >
              {match.away.short}
            </p>
            <p className="mt-1 text-xs text-[var(--fb-text-faint)]">{match.away.name}</p>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-[var(--fb-text-muted)]">
          {match.venue}, {match.city}
        </p>

        {showCountdown && match.status === "scheduled" ? (
          <div className="mt-5">
            <Countdown startsAt={match.startsAt} />
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button href="/matchday" variant="solid">
            Matchday-Center
          </Button>
          {match.streamUrl ? (
            <Button href={match.streamUrl} variant="outline">
              Stream
            </Button>
          ) : null}
          <Link
            href="/spielplan"
            className="inline-flex items-center px-2 text-sm font-medium text-[var(--fb-accent)] hover:underline"
          >
            Spielplan
          </Link>
        </div>
      </div>
    </article>
  );
}
