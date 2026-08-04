import { StandingsPreview } from "@/components/match/standings-preview";
import { PageHero, PlaceholderNote } from "@/components/ui/page-hero";
import { getStandings } from "@/lib/data";

export const metadata = { title: "Tabelle" };

export default function TabellePage() {
  const standings = getStandings();

  return (
    <>
      <PageHero
        eyebrow="2. Bundesliga Frauen"
        title="Tabelle"
        description="Aktueller Stand — später automatisch von handball.net."
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-6 px-[var(--fb-gutter)] py-10 md:py-14">
        <PlaceholderNote>Mock-Tabelle zum Layout-Check.</PlaceholderNote>
        <StandingsPreview rows={standings} limit={standings.length} />
      </div>
    </>
  );
}
