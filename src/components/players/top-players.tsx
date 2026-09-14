import Image from "next/image";
import Link from "next/link";
import type { HydratedTopPlayer } from "@/lib/player-stats-sync";
import type { TopPlayers } from "@/lib/data";
import { cn } from "@/lib/format";

function formatAvg(value: number): string {
  return value.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function PlayerName({ player, className }: { player: HydratedTopPlayer; className?: string }) {
  if (!player.slug) return <span className={className}>{player.name}</span>;
  return (
    <Link href={`/team/${player.slug}`} className={cn("underline-offset-2 hover:underline", className)}>
      {player.name}
    </Link>
  );
}

function Avatar({ player, size }: { player: HydratedTopPlayer; size: "lg" | "sm" }) {
  const box = size === "lg" ? "h-20 w-20 md:h-24 md:w-24" : "h-8 w-8";
  if (player.photo) {
    return (
      <Image
        src={player.photo}
        alt={player.name}
        width={size === "lg" ? 96 : 32}
        height={size === "lg" ? 96 : 32}
        className={cn(box, "rounded-full object-cover object-top")}
      />
    );
  }
  return (
    <span
      className={cn(
        box,
        "inline-flex items-center justify-center rounded-full bg-white/20 text-xs font-semibold",
      )}
    >
      {initials(player.name)}
    </span>
  );
}

function LeaderCard({
  player,
  unit,
  meta,
}: {
  player: HydratedTopPlayer;
  unit: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-[var(--fb-green-950)] px-4 py-4 text-white md:px-5">
      <Avatar player={player} size="lg" />
      <div className="min-w-0">
        <p className="font-[family-name:var(--fb-font-display)] text-4xl font-black leading-none md:text-5xl">
          {player.value}
          <span className="ml-2 align-middle text-sm font-semibold uppercase tracking-[0.12em] text-white/70">
            {unit}
          </span>
        </p>
        <p className="mt-1 text-xs text-white/70">{meta}</p>
        <p className="mt-2 truncate font-semibold">
          <PlayerName player={player} className="text-white" />
        </p>
        <p className="text-xs text-white/60">{player.positionLabel}</p>
      </div>
    </div>
  );
}

function Board({
  title,
  unit,
  players,
  highlightMeta,
}: {
  title: string;
  unit: string;
  players: HydratedTopPlayer[];
  highlightMeta: (player: HydratedTopPlayer) => string;
}) {
  const [lead, ...rest] = players;
  if (!lead) return null;

  return (
    <article className="overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white">
      <p className="sr-only">{title}</p>
      <LeaderCard player={lead} unit={unit} meta={highlightMeta(lead)} />
      {rest.length > 0 ? (
        <ol>
          {rest.map((player) => (
            <li
              key={`${player.rank}-${player.name}`}
              className="flex items-center gap-3 border-t border-[var(--fb-border)] px-4 py-2.5"
            >
              <span className="w-5 text-sm font-semibold tabular-nums text-[var(--fb-text-faint)]">
                {player.rank}
              </span>
              <Avatar player={player} size="sm" />
              <PlayerName
                player={player}
                className="min-w-0 flex-1 truncate font-medium text-[var(--fb-ink)]"
              />
              <span className="text-sm tabular-nums text-[var(--fb-text-muted)]">
                {player.value} {unit}
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </article>
  );
}

export function TopPlayers({ stats }: { stats: TopPlayers }) {
  if (stats.scorers.length === 0 && stats.keepers.length === 0) return null;

  return (
    <section className="mb-10 space-y-4 md:mb-12">
      <h2 className="font-[family-name:var(--fb-font-display)] text-[length:var(--fb-fs-h2)] font-extrabold uppercase leading-[var(--fb-lh-tight)] tracking-[var(--fb-ls-tight)] text-[var(--fb-ink)]">
        Top-Spielerinnen
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Board
          title="Tore"
          unit="Tore"
          players={stats.scorers}
          highlightMeta={(player) => {
            const avg = `Ø ${formatAvg(player.average)} / Spiel`;
            return player.sevenMeterGoals > 0 ? `${avg}, 7-Meter: ${player.sevenMeterGoals}` : avg;
          }}
        />
        <Board
          title="Paraden"
          unit="Paraden"
          players={stats.keepers}
          highlightMeta={(player) => `Ø ${formatAvg(player.average)} / Spiel`}
        />
      </div>
    </section>
  );
}
