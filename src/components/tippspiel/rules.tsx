import { tipCardClass } from "@/components/tippspiel/card";
import { POINTS_DIFF, POINTS_EXACT, POINTS_WINNER } from "@/lib/tippspiel";

export function TippspielRules() {
  return (
    <section className={`${tipCardClass} p-5`}>
      <h2 className="font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase">
        So wird gezählt
      </h2>
      <ul className="mt-3 space-y-2 text-sm text-[var(--fb-text-muted)]">
        <li>
          <strong className="text-[var(--fb-ink)]">{POINTS_EXACT} Punkte:</strong> exakter
          Endstand
        </li>
        <li>
          <strong className="text-[var(--fb-ink)]">{POINTS_DIFF} Punkte:</strong> Sieger und
          Tordifferenz stimmen
        </li>
        <li>
          <strong className="text-[var(--fb-ink)]">{POINTS_WINNER} Punkt:</strong> richtiger
          Sieger (oder korrektes Unentschieden)
        </li>
      </ul>
      <p className="mt-4 text-sm text-[var(--fb-text-muted)]">
        Getippt wird das Füchse-Spiel des Spieltags. Tippschluss ist der Anpfiff. Kostenlos,
        ohne Einsatz. Platz 1 der Woche: 2 Heimspiel-Tickets. Platz 1 der Saison: signiertes
        Trikot.
      </p>
    </section>
  );
}
