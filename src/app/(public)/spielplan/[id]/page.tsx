import { notFound } from "next/navigation";
import { MatchCard } from "@/components/match/match-card";
import { MatchLineup } from "@/components/match/match-lineup";
import { MatchReportStats } from "@/components/match/match-report-stats";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { getMatchById, getMatches } from "@/lib/data";
import { fetchMatchReport, pressReportUrl } from "@/lib/fmp";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 1800;

export async function generateStaticParams() {
  return getMatches()
    .filter((match) => match.fmpMatchId && match.status !== "scheduled")
    .map((match) => ({ id: match.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const match = getMatchById(id);
  if (!match) return { title: "Spielbericht" };
  return { title: `${match.home.short} vs ${match.away.short}` };
}

export default async function MatchReportPage({ params }: Props) {
  const { id } = await params;
  const match = getMatchById(id);
  if (!match) notFound();

  const report = match.fmpMatchId ? await fetchMatchReport(match.fmpMatchId) : null;
  const pdfUrl = match.fmpMatchId ? pressReportUrl(match.fmpMatchId) : null;

  return (
    <>
      <PageHero
        eyebrow="Spielbericht"
        title={`${match.home.short} vs ${match.away.short}`}
        description={
          report
            ? "Aufstellung und Tore aus dem offiziellen Ligaspielbericht."
            : match.fmpMatchId
              ? "Der offizielle Spielbericht erscheint in der Regel kurz nach Abpfiff."
              : "Turniere und Tests haben keinen Ligaspielbericht."
        }
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-8 px-[var(--fb-gutter)] py-10 md:py-14">
        <MatchCard
          match={match}
          emphasis={match.status === "scheduled" ? "upcoming" : "past"}
          showSpielplanLink
          showReportLink={false}
          dimPast={false}
        />

        {pdfUrl ? (
          <div className="flex flex-wrap gap-3">
            <Button href={pdfUrl} variant="solid">
              Spielbericht als PDF
            </Button>
            <Button href="/spielplan" variant="outline">
              Zum Spielplan
            </Button>
          </div>
        ) : null}

        {report ? (
          <>
            <section className="space-y-4">
              <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase">
                Aufstellung
              </h2>
              <MatchLineup ourTeam={report.ourTeam} opponent={report.opponent} />
            </section>
            <section className="space-y-4">
              <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase">
                Spielstatistik
              </h2>
              <MatchReportStats match={match} report={report} />
            </section>
          </>
        ) : (
          <p className="rounded-[var(--fb-radius)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] px-4 py-6 text-sm text-[var(--fb-text-muted)]">
            {match.fmpMatchId
              ? "Spielbericht noch nicht veröffentlicht. Nach Abpfiff hier Aufstellung und Tore."
              : "Für dieses Spiel gibt es keinen Ligaspielbericht (Turnier oder Test)."}
          </p>
        )}
      </div>
    </>
  );
}
