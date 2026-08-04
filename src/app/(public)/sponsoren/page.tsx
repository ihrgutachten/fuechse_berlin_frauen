import { SponsorWall } from "@/components/sponsors/sponsor-wall";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { getSponsors } from "@/lib/data";

export const metadata = { title: "Sponsoren" };

export default function SponsorenPage() {
  const sponsors = getSponsors();

  return (
    <>
      <PageHero
        eyebrow="Partner"
        title="Sponsoren"
        description="Gestuft: Hauptpartner, Partner, Förderer — plus Einstieg für Interessierte."
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-10 px-[var(--fb-gutter)] py-10 md:py-14">
        <SponsorWall sponsors={sponsors} />
        <div className="rounded-[var(--fb-radius-lg)] bg-[var(--fb-green-950)] px-6 py-8 text-white md:px-10">
          <h2 className="font-[family-name:var(--fb-font-display)] text-3xl font-extrabold uppercase">
            Sponsor werden
          </h2>
          <p className="mt-3 max-w-xl text-white/75">
            Sichtbarkeit rund um Spieltage, Matchday-Center und Fan-Tools. Pakete folgen — Kontakt schon jetzt möglich.
          </p>
          <div className="mt-6">
            <Button href="/kontakt" variant="on-dark">
              Kontakt aufnehmen
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
