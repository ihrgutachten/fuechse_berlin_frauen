import Link from "next/link";
import { SquadStatsBrowser } from "@/components/players/squad-stats-browser";
import { PageHero } from "@/components/ui/page-hero";
import { getSquadSeason } from "@/lib/squad-stats";

export const metadata = { title: "Statistiken" };
export const revalidate = 60;

export default async function TeamStatsPage() {
  const rows = await getSquadSeason();

  return (
    <>
      <PageHero
        eyebrow="Saison 2026/27"
        title="Statistiken"
        description="Tore, 7-Meter, Assists, Zeitstrafen und Paraden der Füchse Berlin Frauen."
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-6 px-[var(--fb-gutter)] py-10 md:py-14">
        <p className="text-[var(--fb-text-muted)]">
          <Link
            href="/team"
            className="font-semibold text-[var(--fb-accent)] underline-offset-2 hover:underline"
          >
            Zum Team
          </Link>
        </p>
        {rows.length > 0 ? (
          <SquadStatsBrowser rows={rows} />
        ) : (
          <p className="text-[var(--fb-text-muted)]">Die Saisonwerte sind gerade nicht erreichbar.</p>
        )}
        <p className="text-sm text-[var(--fb-muted)]">
          Quelle:{" "}
          <a
            href="https://www.alsco-hbf.de/team/201--fuchse-berlin/2"
            className="font-semibold text-[var(--fb-accent)] hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            ALSCO HBF
          </a>
          .
        </p>
      </div>
    </>
  );
}
