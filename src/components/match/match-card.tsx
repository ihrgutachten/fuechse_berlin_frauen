import Link from "next/link";
import { ClubLogo } from "@/components/match/club-logo";
import { Countdown } from "@/components/match/countdown";
import { Button } from "@/components/ui/button";
import type { Match } from "@/lib/data";
import { matchContextLabel } from "@/lib/data";
import { cn, formatMatchDate } from "@/lib/format";

type MatchCardProps = {
  match: Match;
  showCountdown?: boolean;
  className?: string;
};

const kindBadge: Record<Match["competitionKind"], string> = {
  liga: "Liga",
  pokal: "Pokal",
  turnier: "Test",
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
  const home = match.isHome;
  const isTournament = match.competitionKind === "turnier";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[var(--fb-radius-lg)] border bg-[var(--fb-surface)]",
        "border-l-[5px]",
        home
          ? "border-[var(--fb-border)] border-l-[var(--fb-accent)]"
          : "border-[var(--fb-away-line)] border-l-[var(--fb-away)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b px-4 py-2.5 text-xs uppercase tracking-[0.12em]",
          home
            ? "border-[var(--fb-home-line)] bg-[var(--fb-home-soft)] text-[var(--fb-green-800)]"
            : "border-[var(--fb-away-line)] bg-[var(--fb-away-soft)] text-[var(--fb-away)]",
        )}
      >
        <span className="flex min-w-0 flex-wrap items-center gap-2 font-semibold">
          <span
            className={cn(
              "rounded-[var(--fb-radius)] px-1.5 py-0.5 text-[10px] font-bold tracking-wider",
              match.competitionKind === "pokal" && "bg-[var(--fb-green-900)] text-[var(--fb-green-300)]",
              match.competitionKind === "liga" && "bg-white/70 text-[var(--fb-green-800)]",
              match.competitionKind === "turnier" && "bg-white/80 text-[var(--fb-text-muted)]",
              !home && match.competitionKind === "liga" && "bg-white/50 text-[var(--fb-away)]",
              !home && match.competitionKind === "turnier" && "bg-white/60 text-[var(--fb-away)]",
              !home && match.competitionKind === "pokal" && "bg-[var(--fb-green-900)] text-[var(--fb-green-300)]",
            )}
          >
            {kindBadge[match.competitionKind]}
          </span>
          <span className="truncate">{matchContextLabel(match)}</span>
        </span>
        <span className={cn("shrink-0", home ? "text-[var(--fb-text-muted)]" : "text-[var(--fb-away)]/80")}>
          {formatMatchDate(match.startsAt)}
        </span>
      </div>

      <div
        className={cn(
          "px-4 py-5",
          home
            ? "bg-gradient-to-br from-[var(--fb-home-soft)]/40 to-white"
            : "bg-gradient-to-br from-[var(--fb-away-soft)]/50 to-white",
        )}
      >
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fb-text-faint)]">
          {match.competitionLabel}
        </p>

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
          {!isTournament ? (
            <Button href="/matchday" variant="solid">
              Matchday-Center
            </Button>
          ) : null}
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
