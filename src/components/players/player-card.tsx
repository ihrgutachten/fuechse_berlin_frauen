import Link from "next/link";
import type { Player } from "@/lib/data";
import { cn } from "@/lib/format";

type PlayerCardProps = {
  player: Player;
  className?: string;
};

export function PlayerCard({ player, className }: PlayerCardProps) {
  return (
    <Link
      href={`/team/${player.slug}`}
      className={cn(
        "group block overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-surface)] transition hover:border-[var(--fb-accent)] hover:shadow-[0_8px_24px_rgba(10,40,24,0.08)]",
        className,
      )}
    >
      <div className="relative flex aspect-[3/4] items-end bg-gradient-to-br from-[var(--fb-green-800)] via-[var(--fb-green-700)] to-[var(--fb-green-950)] p-4">
        <span className="absolute right-3 top-3 font-[family-name:var(--fb-font-display)] text-5xl font-black text-white/15 transition group-hover:text-white/25">
          {player.number}
        </span>
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-green-300)]">
            {player.position}
          </p>
          <h3 className="mt-1 font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase leading-none text-white">
            {player.name}
          </h3>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-sm text-[var(--fb-text-muted)]">
        <span>{player.nationality}</span>
        <span>{player.height}</span>
      </div>
    </Link>
  );
}
