import { StandingsPreview } from "@/components/match/standings-preview";
import { PageHero } from "@/components/ui/page-hero";
import { getStandings } from "@/lib/data";
import { getStandingsSnapshot } from "@/lib/standings-sync";

export const metadata = { title: "Tabelle" };
export const revalidate = 60;

export default async function TabellePage() {
  const [standings, snapshot] = await Promise.all([getStandings(), getStandingsSnapshot()]);
  const liveNote = snapshot
    ? `Live-Stand von ${new Date(snapshot.fetchedAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}.`
    : "Ergebnisse aus den offiziellen HBF-Feeds.";

  return (
    <>
      <PageHero
        eyebrow="2. Bundesliga Frauen"
        title="Tabelle"
        description={liveNote}
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-6 px-[var(--fb-gutter)] py-10 md:py-14">
        <StandingsPreview rows={standings} limit={standings.length} />
        <p className="text-sm text-[var(--fb-muted)]">
          Quelle:{" "}
          <a
            href="https://www.alsco-hbf.de/liga/2-bundesliga/tabelle"
            className="font-semibold text-[var(--fb-accent)] hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            ALSCO HBF, 2. Bundesliga
          </a>
          {". Ergebnisse aus den offiziellen HBF-Feeds."}
        </p>
      </div>
    </>
  );
}
