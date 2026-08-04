import Link from "next/link";
import { ClubLogo } from "@/components/match/club-logo";
import { Countdown } from "@/components/match/countdown";
import { Button } from "@/components/ui/button";
import type { Match } from "@/lib/data";
import { cn, formatMatchDate } from "@/lib/format";

type MatchCardProps = {
  match: Match;
  showCountdown?: boolean;
  className?: string;
};

function TeamBlock({
  team,
  align,
}: {
  team: Match["home"];
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        align === "right" ? "flex-row-reverse text-right" : "text-left",
      )}
    >
      <ClubLogo
        name={team.name}
        short={team.short}
        logo={team.logo}
        hasLogo={team.hasLogo}
        size="md"
      />
      <div className="min-w-0">
        <p
          className={cn(
            "font-[family-name:var(--fb-font-display)] text-lg font-bold uppercase leading-tight md:text-xl",
            team.isUs && "text-[var(--fb-accent)]",
          )}
        >
          {team.short}
        </p>
        <p className="truncate text-xs text-[var(--fb-text-faint)]">{team.name}</p>
      </div>
    </div>
  );
}

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
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-3">
          <TeamBlock team={match.home} align="right" />

          <div className="min-w-[3.5rem] text-center md:min-w-[4.5rem]">
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

          <TeamBlock team={match.away} align="left" />
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
