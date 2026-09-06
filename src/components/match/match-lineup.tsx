import Image from "next/image";
import Link from "next/link";
import type { ReportPlayer, ReportTeam } from "@/lib/parse-press-report";
import { cn } from "@/lib/format";

function PlayerRow({ player, emphasize }: { player: ReportPlayer; emphasize?: boolean }) {
  const name = player.slug ? (
    <Link href={`/team/${player.slug}`} className="font-semibold text-[var(--fb-ink)] hover:underline">
      {player.name}
    </Link>
  ) : (
    <span className="font-semibold text-[var(--fb-ink)]">{player.name}</span>
  );

  return (
    <li className="flex items-center gap-3 border-b border-[var(--fb-border)]/70 py-2.5 last:border-b-0">
      {player.photo ? (
        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[var(--fb-green-900)]">
          <Image src={player.photo} alt="" fill sizes="40px" className="object-cover object-top" />
        </span>
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--fb-soft)] font-[family-name:var(--fb-font-display)] text-sm font-bold text-[var(--fb-text-muted)]">
          {player.number}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate leading-tight">
          <span className="mr-1.5 tabular-nums text-[var(--fb-text-faint)]">{player.number}</span>
          {name}
        </p>
        <p className="truncate text-xs text-[var(--fb-text-faint)]">
          {player.positionLabel ?? "Spielerpass"}
          {player.sevenMeterAttempts > 0 ? ` · 7m ${player.sevenMeterMade}/${player.sevenMeterAttempts}` : ""}
          {player.twoMinutes > 0 ? ` · ${player.twoMinutes}×2 min` : ""}
        </p>
      </div>
      <span
        className={cn(
          "w-8 shrink-0 text-right font-[family-name:var(--fb-font-display)] text-lg font-extrabold tabular-nums",
          emphasize && player.goals > 0 && "text-[var(--fb-accent)]",
        )}
      >
        {player.goals > 0 ? player.goals : "–"}
      </span>
    </li>
  );
}

function TeamLineup({ team, emphasize }: { team: ReportTeam; emphasize?: boolean }) {
  return (
    <div className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white p-4 md:p-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h4 className="font-[family-name:var(--fb-font-display)] text-xl font-extrabold uppercase leading-none">
          {team.isUs ? "Füchse Berlin" : team.name}
        </h4>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fb-text-faint)]">Tore</p>
      </div>
      <ol>
        {team.players.map((player) => (
          <PlayerRow key={`${team.name}-${player.number}`} player={player} emphasize={emphasize} />
        ))}
      </ol>
    </div>
  );
}

export function MatchLineup({
  ourTeam,
  opponent,
}: {
  ourTeam: ReportTeam;
  opponent: ReportTeam;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TeamLineup team={ourTeam} emphasize />
      <TeamLineup team={opponent} />
    </div>
  );
}
