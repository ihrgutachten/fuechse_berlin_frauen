import { MatchCard } from "@/components/match/match-card";
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
        description="Alle 30 Spiele der 2. Handball-Bundesliga Frauen. Ergebnisse später automatisch."
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-6 px-[var(--fb-gutter)] py-10 md:py-14">
        <PlaceholderNote>
          Club-Logos: {logos.ready}/{logos.total} bereit. Fehlende Dateien unter{" "}
          <code className="text-[var(--fb-ink)]">public/clubs/&lt;slug&gt;.png</code> ablegen und in{" "}
          <code className="text-[var(--fb-ink)]">clubs.json</code> <code className="text-[var(--fb-ink)]">hasLogo: true</code> setzen.
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
