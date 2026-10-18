import Image from "next/image";
import Link from "next/link";
import { TeamClient } from "@/components/players/team-client";
import { TopPlayers } from "@/components/players/top-players";
import { PageHero } from "@/components/ui/page-hero";
import { youthSiteUrl } from "@/data/mannschaften";
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
        <Image
          src="/hero/team-hero.webp"
          alt="Mannschaftsfoto der Füchse Berlin Frauen"
          width={1024}
          height={576}
          priority
          sizes="(min-width: 1200px) 1120px, 100vw"
          className="mb-8 h-auto w-full rounded-[var(--fb-radius-lg)]"
        />
        <p className="mb-8 text-[var(--fb-text-muted)]">
          <Link
            href="/mannschaften"
            className="font-semibold text-[var(--fb-accent)] underline-offset-2 hover:underline"
          >
            Alle Mannschaften
          </Link>{" "}
          von den Minis bis zur 2. Frauen. Jugend und Minis auch auf der{" "}
          <a
            href={youthSiteUrl}
            className="font-semibold text-[var(--fb-accent)] underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nachwuchsseite
          </a>
          .{" "}
          <Link
            href="/team/statistiken"
            className="font-semibold text-[var(--fb-accent)] underline-offset-2 hover:underline"
          >
            Saisonstatistiken
          </Link>
          .
        </p>
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
