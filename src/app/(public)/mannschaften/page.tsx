import { MannschaftenBoard } from "@/components/club/mannschaften-board";
import { PageHero } from "@/components/ui/page-hero";
import { youthSiteUrl } from "@/data/mannschaften";

export const metadata = {
  title: "Mannschaften",
  description:
    "2. und 3. Frauen, Jugend und Minis der Füchse Berlin Frauen. Liga und Ansprechpartner.",
};

export default function MannschaftenPage() {
  return (
    <>
      <PageHero
        eyebrow="Alle Mannschaften"
        title="Vom Mini bis in die Bundesliga"
        description="2. und 3. Frauen, Jugend und Minis. Dieselbe Marke, eigene Mannschaft."
      />
      <div className="border-b border-[var(--fb-border)] bg-white">
        <p className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-4 text-[var(--fb-text-muted)]">
          Jugend und Minis haben eine{" "}
          <a
            href={youthSiteUrl}
            className="font-semibold text-[var(--fb-accent)] underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            eigene Seite
          </a>
          .
        </p>
      </div>
      <MannschaftenBoard />
    </>
  );
}
