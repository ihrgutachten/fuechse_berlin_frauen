import { SpielplanClient } from "@/components/match/spielplan-client";
import { PageHero, PlaceholderNote } from "@/components/ui/page-hero";
import { getLogoStatus, getMatches } from "@/lib/data";

export const metadata = { title: "Spielplan" };

export default function SpielplanPage() {
  const matches = getMatches();
  const logos = getLogoStatus();

  return (
    <>
      <PageHero
        eyebrow="Saison 2026/27"
        title="Spielplan"
        description="Liga, DHB-Pokal und Vorbereitungsturniere — chronologisch, filterbar."
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-6 px-[var(--fb-gutter)] py-10 md:py-14">
        <PlaceholderNote>
          Club-Logos: {logos.ready}/{logos.total} bereit. Turnier-Anstoßzeiten beim SUN-Cup ggf. noch
          Platzhalter — bitte gegen offiziellen Turnierplan prüfen.
        </PlaceholderNote>
        <SpielplanClient matches={matches} />
      </div>
    </>
  );
}
