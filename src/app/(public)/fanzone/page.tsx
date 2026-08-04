import { Button } from "@/components/ui/button";
import { PageHero, PlaceholderNote } from "@/components/ui/page-hero";

export const metadata = { title: "Fanzone" };

export default function FanzonePage() {
  return (
    <>
      <PageHero
        eyebrow="Community"
        title="Fanzone"
        description="Fan-Mitgliedschaft, Kids Club, Einlaufkind — leichte Adaption des Herren-Vorbilds."
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-6 px-[var(--fb-gutter)] py-10 md:py-14">
        <PlaceholderNote>Mechaniken folgen in Phase 3. Jetzt: Einstiegsstruktur.</PlaceholderNote>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Fan werden", text: "Mitgliedschaft & Vorteile" },
            { title: "Einlaufkind", text: "Mit den Füchsen einlaufen" },
            { title: "Kids Club", text: "Angebote für Nachwuchs-Fans" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] p-5"
            >
              <h2 className="font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--fb-text-muted)]">{item.text}</p>
              <div className="mt-4">
                <Button variant="outline">Mehr erfahren</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
