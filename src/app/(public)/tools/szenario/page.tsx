import { PageHero, PlaceholderNote } from "@/components/ui/page-hero";

export const metadata = { title: "Szenario-Rechner" };

export default function SzenarioPage() {
  return (
    <>
      <PageHero
        eyebrow="Coming soon"
        title="Aufstiegs-Rechner"
        description="Was-wäre-wenn für Tabelle und Aufstiegsszenarien."
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-6 px-[var(--fb-gutter)] py-10 md:py-14">
        <PlaceholderNote>
          Rechner-UI folgt in Phase 2 — hier nur Struktur.
        </PlaceholderNote>
        <div className="min-h-56 rounded-[var(--fb-radius-lg)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] p-6">
          <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-bold uppercase">
            Szenario-Eingabe
          </h2>
          <p className="mt-2 text-sm text-[var(--fb-text-muted)]">
            Ergebnis-Sliders / Gegner-Ergebnisse · Output: Tabellenplatz-Prognose
          </p>
        </div>
      </div>
    </>
  );
}
