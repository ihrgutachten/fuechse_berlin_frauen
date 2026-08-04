import { PageHero } from "@/components/ui/page-hero";

export const metadata = { title: "Kontakt" };

export default function KontaktPage() {
  return (
    <>
      <PageHero
        eyebrow="Anfahrt"
        title="Kontakt"
        description="Sporthalle Charlottenburg — Heimspielstätte der Füchse Berlin Frauen."
      />
      <div className="mx-auto grid max-w-[var(--fb-container)] gap-8 px-[var(--fb-gutter)] py-10 md:grid-cols-2 md:py-14">
        <div>
          <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-bold uppercase">
            Sporthalle Charlottenburg
          </h2>
          <p className="mt-3 text-[var(--fb-text-muted)]">
            Platzhalter-Adresse
            <br />
            Berlin-Charlottenburg
          </p>
          <p className="mt-4 text-sm text-[var(--fb-text-muted)]">
            E-Mail: kontakt@fuechseberlinfrauen.de (Platzhalter)
          </p>
        </div>
        <div className="flex min-h-56 items-center justify-center rounded-[var(--fb-radius-lg)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] text-sm text-[var(--fb-text-muted)]">
          Karten-Embed folgt
        </div>
      </div>
    </>
  );
}
