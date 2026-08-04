import { PageHero } from "@/components/ui/page-hero";

export const metadata = { title: "Verein" };

export default function VereinPage() {
  return (
    <>
      <PageHero
        eyebrow="Über uns"
        title="Der Verein"
        description="Von Spreefüxxe zu Füchse Berlin Frauen — Historie und Haltung."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-[var(--fb-gutter)] py-10 md:py-14">
        <p className="text-lg text-[var(--fb-text-muted)]">
          Bis 30. Juni 2026 hieß der Verein Spreefüxxe. Seit 1. Juli 2026 treten wir als{" "}
          <strong className="text-[var(--fb-ink)]">Füchse Berlin Frauen</strong> an — eine Marke mit den Herren,
          eigenes Revier, eigene Story.
        </p>
        <p className="text-[var(--fb-text-muted)]">
          Platzhalter-Text für Historie, Werte und Meilensteine. Redaktioneller Content kommt später über CMS.
        </p>
      </div>
    </>
  );
}
