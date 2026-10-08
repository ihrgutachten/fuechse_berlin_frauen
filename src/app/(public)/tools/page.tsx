import { ToolTeaser, PageHero } from "@/components/ui/page-hero";
import { getModuleState } from "@/lib/modules-db";

export const metadata = { title: "Fan-Tools" };

export default async function ToolsPage() {
  const modules = await getModuleState();

  return (
    <>
      <PageHero
        eyebrow="Engagement"
        title="Fan-Tools"
        description="Interaktive Features. Das Differenzierungsmerkmal gegenüber Broschüren-Seiten."
      />
      <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-10 md:py-14">
        <div className="grid gap-5 md:grid-cols-2">
          {modules.tippspiel ? (
            <ToolTeaser
              href="/tools/tippspiel"
              title="Spieltags-Tippspiel"
              description="Vor dem Anpfiff tippen. Wöchentlich 2 Heimspiel-Tickets, zur Saison ein signiertes Trikot."
              comingSoon={false}
            />
          ) : null}
          {modules.aufstiegsrechner ? (
            <ToolTeaser
              href="/tools/szenario"
              title="Aufstiegs-Rechner"
              description="Szenarien durchspielen: Was braucht's für Platz X? Tippe offene Spiele, die Tabelle reagiert."
              comingSoon={false}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
