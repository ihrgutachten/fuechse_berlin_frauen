import { ClubLogo } from "@/components/match/club-logo";
import { Countdown } from "@/components/match/countdown";
import { Button } from "@/components/ui/button";
import { PageHero, PlaceholderNote } from "@/components/ui/page-hero";
import { getNextMatch } from "@/lib/data";
import { formatMatchDate } from "@/lib/format";

export const metadata = { title: "Matchday" };

/** Refresh next-match selection after kickoff without a full redeploy. */
export const revalidate = 60;

export default function MatchdayPage() {
  const match = getNextMatch();

  return (
    <>
      <PageHero
        eyebrow="Live-Center"
        title="Matchday"
        description="Countdown, Halle, Stream — der Treffpunkt vor dem Anpfiff."
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-8 px-[var(--fb-gutter)] py-10 md:py-14">
        {match ? (
          <>
            <div className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-green-950)] p-6 text-white md:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fb-green-300)]">
                    Nächstes Spiel · {formatMatchDate(match.startsAt)}
                  </p>
                  <h2 className="mt-3 font-[family-name:var(--fb-font-display)] text-3xl font-extrabold uppercase md:text-4xl">
                    {match.home.short} vs {match.away.short}
                  </h2>
                  <p className="mt-2 text-white/70">
                    {match.isHome ? "Heimspiel" : "Auswärtsspiel"} · {match.competitionLabel}
                  </p>
                </div>

                <div
                  className="flex shrink-0 items-center justify-start gap-3 sm:justify-end sm:gap-4 sm:pt-1"
                  aria-hidden
                >
                  <ClubLogo
                    name={match.home.name}
                    short={match.home.short}
                    logo={match.home.logo}
                    hasLogo={match.home.hasLogo}
                    size="lg"
                    className="h-14 w-14 rounded-full bg-white/95 p-1.5 md:h-16 md:w-16"
                  />
                  <span className="font-[family-name:var(--fb-font-display)] text-sm font-bold uppercase text-white/40 md:text-base">
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

              <div className="mt-6">
                <Countdown startsAt={match.startsAt} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {match.streamUrl ? (
                  <Button href={match.streamUrl} variant="on-dark">
                    Stream öffnen
                  </Button>
                ) : null}
                <Button
                  href="/spielplan"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  Spielplan
                </Button>
              </div>
            </div>

            <section
              aria-labelledby="matchday-halle"
              className="overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-soft)]"
            >
              <div className="border-b border-[var(--fb-border)] bg-white px-6 py-5 md:px-8 md:py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fb-accent)]">
                  {match.isHome ? "Heimspielstätte" : "Auswärtshalle"}
                </p>
                <h3
                  id="matchday-halle"
                  className="mt-2 font-[family-name:var(--fb-font-display)] text-3xl font-extrabold uppercase leading-none tracking-tight text-[var(--fb-ink)] md:text-4xl"
                >
                  {match.venue}
                </h3>
                <p className="mt-2 text-lg text-[var(--fb-text-muted)]">{match.city}</p>
              </div>

              <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_1fr] md:px-8 md:py-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-text-faint)]">
                    Adresse
                  </p>
                  {match.venueAddress ? (
                    <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-[var(--fb-ink)] md:text-lg">
                      {match.venueAddress.replace(", ", "\n")}
                    </p>
                  ) : (
                    <p className="mt-2 text-[var(--fb-text-muted)]">
                      Adresse folgt — später automatisch von handball.net.
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    {match.mapsUrl ? (
                      <Button href={match.mapsUrl} variant="solid">
                        Route planen
                      </Button>
                    ) : null}
                    {match.isHome ? (
                      <Button href="/kontakt" variant="outline">
                        Anfahrt & Kontakt
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[var(--fb-radius)] border border-dashed border-[var(--fb-border)] bg-white/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-text-faint)]">
                    Hinweis
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--fb-text-muted)]">
                    {match.isHome
                      ? "U7 Mierendorffplatz · Bus M27, 109. Abendkasse und Einlasszeiten folgen im Matchday-Ticker."
                      : "Offizielle Hallenadresse vom Ligaportal. Vor Ort auf aktuelle Hinweise des Gastgebers achten."}
                  </p>
                </div>
              </div>
            </section>
          </>
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
          Hallenblock ist vorbereitet: später kommen Adresse und Route direkt aus handball.net.
        </PlaceholderNote>
      </div>
    </>
  );
}
