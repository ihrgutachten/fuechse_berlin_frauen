import { SpielplanClient } from "@/components/match/spielplan-client";
import { PageHero, PlaceholderNote } from "@/components/ui/page-hero";
import { getLogoStatus, getMatches, pickNextMatch } from "@/lib/data";

export const metadata = { title: "Spielplan" };

/** Keep next-match highlight current after kickoff. */
export const revalidate = 60;

export default function SpielplanPage() {
  const matches = getMatches();
  const logos = getLogoStatus();
  const nextMatchId = pickNextMatch(matches)?.id;

  return (
    <>
      <PageHero
        eyebrow="Saison 2026/27"
        title="Spielplan"
        description="Liga, DHB-Pokal und Vorbereitungsturniere, chronologisch und filterbar."
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-6 px-[var(--fb-gutter)] py-10 md:py-14">
        <PlaceholderNote>
          Club-Logos: {logos.ready}/{logos.total} bereit.
        </PlaceholderNote>
        <SpielplanClient matches={matches} nextMatchId={nextMatchId} />
      </div>
    </>
  );
}
