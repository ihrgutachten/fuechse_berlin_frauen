import { ClubLogo } from "@/components/match/club-logo";
import { Countdown } from "@/components/match/countdown";
import type { Match } from "@/lib/data";
import { matchContextLabel } from "@/lib/data";
import { formatMatchDate, cn } from "@/lib/format";
import type { TipPhase } from "@/lib/tippspiel";

const phaseLabel: Record<TipPhase, string> = {
  open: "Tipp offen",
  locked: "Tippschluss",
  scored: "Abgerechnet",
};

export function TippspielMatchBanner({
  match,
  phase,
  stacked = false,
}: {
  match: Match;
  phase: TipPhase;
  stacked?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-[var(--fb-green-950)] p-5 text-white md:p-8",
        stacked && "border-t border-[var(--fb-home-line)]",
        !stacked &&
          "rounded-[var(--fb-radius-lg)] border border-[var(--fb-home-line)] shadow-[0_10px_28px_rgba(4,20,12,0.08)]",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fb-green-300)]">
            {phaseLabel[phase]} · {matchContextLabel(match)}
          </p>
          <h2 className="mt-3 font-[family-name:var(--fb-font-display)] text-3xl font-extrabold uppercase md:text-4xl">
            {match.home.short} vs {match.away.short}
          </h2>
          <p className="mt-2 text-white/70">
            {formatMatchDate(match.startsAt)} · {match.competitionLabel}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:pt-1" aria-hidden>
          <ClubLogo
            name={match.home.name}
            short={match.home.short}
            logo={match.home.logo}
            hasLogo={match.home.hasLogo}
            size="lg"
            className="h-14 w-14 rounded-full bg-white/95 p-1.5 md:h-16 md:w-16"
          />
          <span className="font-[family-name:var(--fb-font-display)] text-sm font-bold uppercase text-white/40">
            vs
          </span>
          <ClubLogo
            name={match.away.name}
            short={match.away.short}
            logo={match.away.logo}
            hasLogo={match.away.hasLogo}
            size="lg"
            className="h-14 w-14 rounded-full bg-white/95 p-1.5 md:h-16 md:w-16"
          />
        </div>
      </div>

      {phase === "open" ? (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
            Tippschluss
          </p>
          <Countdown startsAt={match.startsAt} />
        </div>
      ) : null}

      {phase === "scored" && match.homeScore != null && match.awayScore != null ? (
        <p className="mt-6 font-[family-name:var(--fb-font-display)] text-4xl font-extrabold tabular-nums">
          {match.homeScore}:{match.awayScore}
        </p>
      ) : null}

      {phase === "locked" ? (
        <p className="mt-6 text-sm text-white/70">
          Tipps sind eingefroren. Nach dem Abpfiff zählen die Punkte.
        </p>
      ) : null}
    </div>
  );
}
