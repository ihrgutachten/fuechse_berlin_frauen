import Link from "next/link";
import { MatchCard } from "@/components/match/match-card";
import { StandingsPreview } from "@/components/match/standings-preview";
import { NewsCard } from "@/components/news/news-card";
import { SponsorWall } from "@/components/sponsors/sponsor-wall";
import { Button } from "@/components/ui/button";
import { FanProjectOverlay } from "@/components/ui/fan-project-overlay";
import { SectionHeading } from "@/components/ui/section-heading";
import { getNews, getNextMatch, getSponsors, getStandings, homepageSponsorTiers } from "@/lib/data";

export default function HomePage() {
  const nextMatch = getNextMatch();
  const news = getNews().slice(0, 3);
  const standings = getStandings();
  const sponsors = getSponsors();

  return (
    <>
      <FanProjectOverlay />
      <section className="relative isolate min-h-[88vh] overflow-hidden bg-[var(--fb-green-950)] text-white">
        <div
          className="hero-glow pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--fb-green-500)]/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-[var(--fb-green-700)]/40 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, transparent 0 2px, rgba(255,255,255,0.35) 2px 3px, transparent 3px), linear-gradient(135deg, transparent 40%, rgba(34,160,85,0.25))",
            backgroundSize: "28px 28px, 100% 100%",
          }}
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[88vh] max-w-[var(--fb-container)] flex-col justify-end px-[var(--fb-gutter)] pb-14 pt-24 md:pb-20">
          <p className="animate-fade-up text-[var(--fb-fs-label)] font-semibold uppercase tracking-[0.22em] text-[var(--fb-green-300)]">
            2. Handball-Bundesliga · Berlin
          </p>
          <h1 className="animate-fade-up-delay mt-4 max-w-4xl font-[family-name:var(--fb-font-display)] text-[length:var(--fb-fs-hero)] font-extrabold uppercase leading-[0.9] tracking-tight">
            Füchse Berlin
            <span className="block text-[var(--fb-green-300)]">Frauen</span>
          </h1>
          <p className="animate-fade-up-delay-2 mt-5 max-w-xl text-lg text-white/80">
            Handball aus dem Revier. Tempo, Härte, Berliner Attitude — jetzt unter einem Namen mit den Herren.
          </p>
          <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
            <Button href="/matchday" variant="on-dark">
              Zum Matchday-Center
            </Button>
            <Button
              href="/spielplan"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 hover:text-white"
            >
              Spielplan
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-12 md:py-16">
        <SectionHeading
          eyebrow="Nächstes Spiel"
          title="Countdown im Revier"
          description="Mock-Daten — später live von handball.net."
          action={
            <Button href="/spielplan" variant="ghost">
              Alle Spiele
            </Button>
          }
        />
        {nextMatch ? <MatchCard match={nextMatch} showCountdown /> : null}
      </section>

      <section className="bg-[var(--fb-soft)] py-12 md:py-16">
        <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)]">
          <SectionHeading
            eyebrow="News"
            title="Aus dem Revier"
            action={
              <Button href="/news" variant="ghost">
                Alle News
              </Button>
            }
          />
          <div className="grid gap-5 md:grid-cols-3">
            {news.map((item) => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Tabelle"
              title="Platzierung"
              description="Vorschau mit Mock-Standings."
            />
            <StandingsPreview rows={standings} />
          </div>
          <div>
            <SectionHeading
              eyebrow="Fan-Tools"
              title="Mehr als Broschüre"
              description="Tippspiel & Szenario-Rechner — Coming soon, Struktur steht."
            />
            <div className="space-y-3">
              <Link
                href="/tools/tippspiel"
                className="flex items-center justify-between rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white px-4 py-4 transition hover:border-[var(--fb-accent)]"
              >
                <div>
                  <p className="font-semibold text-[var(--fb-ink)]">Spieltags-Tippspiel</p>
                  <p className="text-sm text-[var(--fb-text-muted)]">Tippen, mitfiebern, Daten für Sponsoren.</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--fb-accent)]">Soon</span>
              </Link>
              <Link
                href="/tools/szenario"
                className="flex items-center justify-between rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white px-4 py-4 transition hover:border-[var(--fb-accent)]"
              >
                <div>
                  <p className="font-semibold text-[var(--fb-ink)]">Aufstiegs-Rechner</p>
                  <p className="text-sm text-[var(--fb-text-muted)]">Was muss passieren? Szenarien durchspielen.</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--fb-accent)]">Soon</span>
              </Link>
              <Button href="/tools" className="w-full sm:w-auto">
                Alle Tools
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--fb-border)] bg-white py-12 md:py-16">
        <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)]">
          <SectionHeading
            eyebrow="Partner"
            title="Sponsoren"
            action={
              <Button href="/sponsoren" variant="ghost">
                Sponsor werden
              </Button>
            }
          />
          <SponsorWall sponsors={sponsors} tiers={homepageSponsorTiers} />
        </div>
      </section>
    </>
  );
}
