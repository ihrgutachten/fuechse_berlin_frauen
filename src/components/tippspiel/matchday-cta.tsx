import { weeklyPrizeText } from "@/components/tippspiel/prizes";
import { SeasonPodium, WeeklyWinnerCard } from "@/components/tippspiel/highlights";
import { Button } from "@/components/ui/button";
import { isDatabaseConfigured } from "@/lib/db";
import { matchContextLabel, type Match } from "@/lib/data";
import { getTipPhase } from "@/lib/tippspiel";
import { getMatchLeaderboard, getSeasonLeaderboard } from "@/lib/tippspiel-db";
import { hydrateTippspiel } from "@/lib/tippspiel-results";

export async function TippspielMatchdayCta({ match }: { match: Match }) {
  const { matches, lastFinished } = await hydrateTippspiel();
  const current = matches.find((item) => item.id === match.id) ?? match;
  const phase = getTipPhase(current);
  const weekly = weeklyPrizeText(current);

  let winner = null;
  let seasonTop: Awaited<ReturnType<typeof getSeasonLeaderboard>> = [];

  if (isDatabaseConfigured()) {
    try {
      if (lastFinished && getTipPhase(lastFinished) === "scored") {
        const board = await getMatchLeaderboard(lastFinished.id);
        winner = board[0] ?? null;
      }
      seasonTop = await getSeasonLeaderboard();
    } catch (err) {
      console.error("[tippspiel] matchday cta", err);
    }
  }

  const copy =
    phase === "open"
      ? {
          eyebrow: "Tippspiel",
          title: "Tipp abgeben",
          text: `${matchContextLabel(current)}. Diese Woche zu gewinnen: ${weekly}.`,
          label: "Jetzt tippen",
        }
      : phase === "locked"
        ? {
            eyebrow: "Tippspiel",
            title: "Tippschluss",
            text: `Dein Tipp ist eingefroren. Nach dem offiziellen Endstand geht es um ${weekly}.`,
            label: "Zur Rangliste",
          }
        : {
            eyebrow: "Tippspiel",
            title: "Punkte holen",
            text: `Ergebnis ist da. Spieltagspreis: ${weekly}.`,
            label: "Rangliste",
          };

  return (
    <div className="space-y-4">
      <section className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fb-accent)]">
          {copy.eyebrow}
        </p>
        <h3 className="mt-2 font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase">
          {copy.title}
        </h3>
        <p className="mt-2 text-sm text-[var(--fb-text-muted)]">{copy.text}</p>
        <div className="mt-4">
          <Button href="/tools/tippspiel">{copy.label}</Button>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {lastFinished ? <WeeklyWinnerCard match={lastFinished} winner={winner} /> : null}
        <SeasonPodium rows={seasonTop} />
      </div>
    </div>
  );
}
