import { ScenarioCalculator } from "@/components/tools/scenario-calculator";
import { PageHero } from "@/components/ui/page-hero";
import { getScenarioInput } from "@/lib/data";

export const metadata = { title: "Aufstiegs-Rechner" };
export const revalidate = 60;

export default async function SzenarioPage() {
  const { standings, fixtures } = await getScenarioInput();

  return (
    <>
      <PageHero
        eyebrow="Fan-Tools"
        title="Aufstiegs-Rechner"
        description="Was muss passieren? Trag Tore ein. Punkte und Tordifferenz laufen mit."
      />
      <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-10 md:py-14">
        {standings.length === 0 ? (
          <p className="rounded-[var(--fb-radius)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] px-4 py-6 text-sm text-[var(--fb-text-muted)]">
            Tabelle ist gerade nicht verfügbar.
          </p>
        ) : (
          <ScenarioCalculator standings={standings} fixtures={fixtures} />
        )}
      </div>
    </>
  );
}
