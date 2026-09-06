import { MatchCard } from "@/components/match/match-card";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { getNextHomeMatch } from "@/lib/data";
import { TICKET_SHOP_URL, ticketPriceGroups } from "@/lib/tickets";

export const metadata = {
  title: "Tickets",
  description:
    "Heimspiel-Tickets der Füchse Berlin Frauen online kaufen. Vorverkauf über den Ticketshop in der Sporthalle Charlottenburg.",
};

export const revalidate = 60;

export default function TicketsPage() {
  const nextHome = getNextHomeMatch();

  return (
    <>
      <PageHero
        eyebrow="Heimspiele"
        title="Tickets"
        description="Online im Vorverkauf über den Ticketshop des Vereins. Anstoß in der Sporthalle Charlottenburg."
      />

      <div className="mx-auto max-w-[var(--fb-container)] space-y-12 px-[var(--fb-gutter)] py-10 md:py-14">
        <section className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-green-950)] px-6 py-8 text-white md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fb-green-300)]">
            Ticketshop
          </p>
          <h2 className="mt-3 font-[family-name:var(--fb-font-display)] text-3xl font-extrabold uppercase md:text-4xl">
            Karten online kaufen
          </h2>
          <p className="mt-3 max-w-2xl text-white/75">
            Der Vorverkauf läuft über leoticket auf der Vereinsseite. Digitalticket aufs Handy oder
            ausdrucken. Abendkasse in der Halle bleibt zusätzlich offen.
          </p>
          <div className="mt-6">
            <Button href={TICKET_SHOP_URL} variant="on-dark">
              Zum Ticketshop
            </Button>
          </div>
        </section>

        {nextHome ? (
          <section>
            <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase tracking-tight text-[var(--fb-ink)]">
              Nächstes Heimspiel
            </h2>
            <div className="mt-5">
              <MatchCard match={nextHome} showCountdown emphasis="next" />
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase tracking-tight text-[var(--fb-ink)]">
            Preise
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--fb-text-muted)]">
            Orientierung aus dem Vereinsshop. Verbindlich ist der Preis im Ticketshop bei der Buchung.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {ticketPriceGroups.map((group) => (
              <article
                key={group.title}
                className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white p-5"
              >
                <h3 className="font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase tracking-tight">
                  {group.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--fb-text-muted)]">{group.subtitle}</p>
                <ul className="mt-4 space-y-3">
                  {group.rows.map((row) => (
                    <li key={row.label} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[var(--fb-ink)]">{row.label}</p>
                        {row.note ? (
                          <p className="mt-0.5 text-xs text-[var(--fb-text-faint)]">{row.note}</p>
                        ) : null}
                      </div>
                      <p className="shrink-0 font-[family-name:var(--fb-font-display)] text-lg font-extrabold tabular-nums">
                        {row.price}
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-soft)] px-6 py-6 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-accent)]">
            Spielhalle
          </p>
          <h2 className="mt-2 font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase tracking-tight">
            Sporthalle Charlottenburg
          </h2>
          <p className="mt-2 text-[var(--fb-text-muted)]">
            Sömmeringstraße 29, 10589 Berlin
            <br />
            U7 Mierendorffplatz · Bus M27, 109
          </p>
          <div className="mt-5">
            <Button href="/kontakt" variant="outline">
              Anfahrt
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
