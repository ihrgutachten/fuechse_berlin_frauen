import { MannschaftenBoard } from "@/components/club/mannschaften-board";
import { PageHero } from "@/components/ui/page-hero";

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
      <MannschaftenBoard />
    </>
  );
}
