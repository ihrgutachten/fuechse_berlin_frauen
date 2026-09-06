import { tipCardClass } from "@/components/tippspiel/card";
import type { Match } from "@/lib/data";
import { formatMatchDate } from "@/lib/format";
import { getNextHomeMatchAfter } from "@/lib/tippspiel";

export const WEEKLY_PRIZE = "2 Tickets für das nächste Heimspiel";
export const SEASON_PRIZE =
  "ein von allen Spielerinnen unterschriebenes Heimtrikot der aktuellen Saison";

export function weeklyPrizeText(match?: Match): string {
  if (!match) return WEEKLY_PRIZE;
  const nextHome = getNextHomeMatchAfter(match.startsAt);
  if (!nextHome) return WEEKLY_PRIZE;
  const opponent = nextHome.isHome ? nextHome.away.short : nextHome.home.short;
  return `2 Tickets fürs Heimspiel gegen ${opponent} (${formatMatchDate(nextHome.startsAt)})`;
}

export function TippspielPrizes({ match }: { match?: Match }) {
  const weekly = weeklyPrizeText(match);

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className={`${tipCardClass} p-5 md:p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fb-accent)]">
          Spieltagspreis
        </p>
        <h2 className="mt-2 font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase">
          2 Heimspiel-Tickets
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--fb-text-muted)]">
          Platz 1 der Woche gewinnt {weekly}. Der Preis gilt standardmäßig jeden Spieltag.
        </p>
      </article>
      <article className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-home-line)] bg-[var(--fb-green-950)] p-5 text-white shadow-[0_10px_28px_rgba(4,20,12,0.08)] md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fb-green-300)]">
          Saisonpreis
        </p>
        <h2 className="mt-2 font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase">
          Signiertes Trikot
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          Platz 1 der Saisonwertung bekommt {SEASON_PRIZE}.
        </p>
      </article>
    </section>
  );
}
