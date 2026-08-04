import { Countdown } from "@/components/match/countdown";
import { Button } from "@/components/ui/button";
import { PageHero, PlaceholderNote } from "@/components/ui/page-hero";
import { getNextMatch } from "@/lib/data";
import { formatMatchDate } from "@/lib/format";

export const metadata = { title: "Matchday" };

export default function MatchdayPage() {
  const match = getNextMatch();

  return (
    <>
      <PageHero
        eyebrow="Live-Center"
        title="Matchday"
        description="Countdown, Ticker, Aufstellung, Stream — Skeleton für Phase 2."
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-8 px-[var(--fb-gutter)] py-10 md:py-14">
        {match ? (
          <div className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-green-950)] p-6 text-white md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fb-green-300)]">
              Nächstes Spiel · {formatMatchDate(match.startsAt)}
            </p>
            <h2 className="mt-3 font-[family-name:var(--fb-font-display)] text-3xl font-extrabold uppercase md:text-4xl">
              {match.home.short} vs {match.away.short}
            </h2>
            <p className="mt-2 text-white/70">
              {match.venue}, {match.city}
            </p>
            <div className="mt-6">
              <Countdown startsAt={match.startsAt} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={match.streamUrl ?? "#"} variant="on-dark">
                Stream öffnen
              </Button>
              <Button
                href="/spielplan"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Spielplan
              </Button>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          {["Liveticker", "Aufstellung", "Spielstatistik"].map((label) => (
            <div
              key={label}
              className="min-h-40 rounded-[var(--fb-radius-lg)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] p-5"
            >
              <h3 className="font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase">
                {label}
              </h3>
              <p className="mt-2 text-sm text-[var(--fb-text-muted)]">
                Modul-Platzhalter — Anbindung in Phase 2.
              </p>
            </div>
          ))}
        </div>

        <PlaceholderNote>
          Matchday-Center ist als app-artiges Skelett angelegt.
        </PlaceholderNote>
      </div>
    </>
  );
}
