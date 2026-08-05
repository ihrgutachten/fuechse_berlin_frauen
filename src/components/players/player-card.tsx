import Image from "next/image";
import Link from "next/link";
import type { Player } from "@/lib/data";
import { cn } from "@/lib/format";

type PlayerCardProps = {
  player: Player;
  className?: string;
};

export function PlayerCard({ player, className }: PlayerCardProps) {
  const isPlayer = player.role === "spielerin";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-surface)] transition hover:border-[var(--fb-accent)] hover:shadow-[0_8px_24px_rgba(10,40,24,0.08)]",
        className,
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--fb-green-900)]">
        <Image
          src={player.photo}
          alt={`${player.name}${player.positionLabel ? ` – ${player.positionLabel}` : ""}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        {isPlayer && player.number != null ? (
          <span className="absolute right-3 top-3 font-[family-name:var(--fb-font-display)] text-5xl font-black text-white/25">
            {player.number}
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-green-300)]">
            {player.positionLabel || player.position}
          </p>
          <h3 className="mt-1 font-[family-name:var(--fb-font-display)] text-xl font-extrabold uppercase leading-none md:text-2xl">
            <Link
              href={`/team/${player.slug}`}
              className="text-white underline-offset-4 hover:underline focus-visible:underline"
            >
              {player.name}
            </Link>
          </h3>
        </div>
      </div>
      <div className="px-4 py-3">
        {isPlayer && player.patron ? (
          <p className="text-sm text-[var(--fb-text-muted)]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fb-text-faint)]">
              Patenschaft
            </span>
            {player.patronUrl ? (
              <a
                href={player.patronUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 block font-medium text-[var(--fb-accent)] underline-offset-2 hover:underline"
              >
                {player.patron}
              </a>
            ) : (
              <span className="mt-0.5 block font-medium text-[var(--fb-ink)]">{player.patron}</span>
            )}
          </p>
        ) : (
          <p className="text-sm text-[var(--fb-text-muted)]">
            {player.role === "coach" ? "Trainerstab" : "Staff"}
          </p>
        )}
      </div>
    </article>
  );
}
