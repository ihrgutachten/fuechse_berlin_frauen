import { MatchCard } from "@/components/match/match-card";
import { PageHero, PlaceholderNote } from "@/components/ui/page-hero";
import { getMatches } from "@/lib/data";

export const metadata = { title: "Spielplan" };

export default function SpielplanPage() {
  const matches = getMatches();

  return (
    <>
      <PageHero
        eyebrow="Saison"
        title="Spielplan"
        description="Heim- und Auswärtsspiele. Quelle später: handball.net."
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-6 px-[var(--fb-gutter)] py-10 md:py-14">
        <PlaceholderNote>
          Platzhalter-Spielplan mit lokalen Mock-Daten.
        </PlaceholderNote>
        <div className="grid gap-5 lg:grid-cols-2">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </>
  );
}
