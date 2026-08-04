import { ToolTeaser, PageHero } from "@/components/ui/page-hero";

export const metadata = { title: "Fan-Tools" };

export default function ToolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Engagement"
        title="Fan-Tools"
        description="Interaktive Features — das Differenzierungsmerkmal gegenüber Broschüren-Seiten."
      />
      <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-10 md:py-14">
        <div className="grid gap-5 md:grid-cols-2">
          <ToolTeaser
            href="/tools/tippspiel"
            title="Spieltags-Tippspiel"
            description="Vor dem Anpfiff tippen, mit der Community mitfiebern, Sponsoring-Fläche nutzen."
          />
          <ToolTeaser
            href="/tools/szenario"
            title="Aufstiegs-Rechner"
            description="Szenarien durchspielen: Was braucht's für Platz X? Thematisch stark nach knappen Entscheidungen."
          />
        </div>
      </div>
    </>
  );
}
