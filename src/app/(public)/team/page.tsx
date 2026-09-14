import { TeamClient } from "@/components/players/team-client";
import { TopPlayers } from "@/components/players/top-players";
import { PageHero } from "@/components/ui/page-hero";
import { getTeamMembers, getTopPlayers } from "@/lib/data";

export const metadata = { title: "Team" };
export const revalidate = 60;

export default async function TeamPage() {
  const members = getTeamMembers();
  const topPlayers = await getTopPlayers();

  return (
    <>
      <PageHero
        eyebrow="Saison 2026/27"
        title="Das Team"
        description="Spielerinnen, Trainerstab und Staff der Füchse Berlin Frauen."
      />
      <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-10 md:py-14">
        <TopPlayers stats={topPlayers} />
        <TeamClient members={members} />
        <p className="mt-8 text-sm text-[var(--fb-muted)]">
          Saisonwerte:{" "}
          <a
            href="https://www.alsco-hbf.de/team/201--fuchse-berlin/2"
            className="font-semibold text-[var(--fb-accent)] hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            ALSCO HBF
          </a>
          . Aktualisierung nach Abpfiff in den Ergebnis-Fenstern.
        </p>
      </div>
    </>
  );
}
