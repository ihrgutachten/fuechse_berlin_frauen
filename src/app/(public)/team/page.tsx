import { TeamClient } from "@/components/players/team-client";
import { PageHero } from "@/components/ui/page-hero";
import { getTeamMembers } from "@/lib/data";

export const metadata = { title: "Team" };

export default function TeamPage() {
  const members = getTeamMembers();

  return (
    <>
      <PageHero
        eyebrow="Saison 2026/27"
        title="Das Team"
        description="Leidenschaft, Teamgeist und Höchstleistung — Spielerinnen, Trainerstab und Staff der Füchse Berlin Frauen."
      />
      <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-10 md:py-14">
        <TeamClient members={members} />
      </div>
    </>
  );
}
