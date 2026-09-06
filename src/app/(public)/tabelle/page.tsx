import { StandingsPreview } from "@/components/match/standings-preview";
import { PageHero } from "@/components/ui/page-hero";
import { getStandings } from "@/lib/data";

export const metadata = { title: "Tabelle" };

export default function TabellePage() {
  const standings = getStandings();

  return (
    <>
      <PageHero
        eyebrow="2. Bundesliga Frauen"
        title="Tabelle"
        description="Aktueller Stand nach zwei Spieltagen."
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-6 px-[var(--fb-gutter)] py-10 md:py-14">
        <StandingsPreview rows={standings} limit={standings.length} />
      </div>
    </>
  );
}
