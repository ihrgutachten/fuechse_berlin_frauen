import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { getPlayerBySlug, getPlayers } from "@/lib/data";

type Props = { params: Promise<{ spielerin: string }> };

export async function generateStaticParams() {
  return getPlayers().map((p) => ({ spielerin: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { spielerin } = await params;
  const player = getPlayerBySlug(spielerin);
  return { title: player?.name ?? "Spielerin" };
}

export default async function PlayerPage({ params }: Props) {
  const { spielerin } = await params;
  const player = getPlayerBySlug(spielerin);
  if (!player) notFound();

  return (
    <>
      <PageHero eyebrow={`#${player.number} · ${player.position}`} title={player.name} />
      <div className="mx-auto grid max-w-[var(--fb-container)] gap-8 px-[var(--fb-gutter)] py-10 md:grid-cols-[240px_1fr] md:py-14">
        <div className="flex aspect-[3/4] items-end rounded-[var(--fb-radius-lg)] bg-gradient-to-br from-[var(--fb-green-800)] to-[var(--fb-green-950)] p-4 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--fb-green-300)]">Platzhalter</p>
            <p className="font-[family-name:var(--fb-font-display)] text-4xl font-black">
              {player.number}
            </p>
          </div>
        </div>
        <div>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[var(--fb-text-faint)]">Position</dt>
              <dd className="font-semibold">{player.position}</dd>
            </div>
            <div>
              <dt className="text-[var(--fb-text-faint)]">Nation</dt>
              <dd className="font-semibold">{player.nationality}</dd>
            </div>
            <div>
              <dt className="text-[var(--fb-text-faint)]">Größe</dt>
              <dd className="font-semibold">{player.height}</dd>
            </div>
          </dl>
          <p className="mt-6 text-[var(--fb-text-muted)]">{player.bio}</p>
          <div className="mt-6 rounded-[var(--fb-radius)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] p-4 text-sm text-[var(--fb-text-muted)]">
            Stats-Visualisierungen (Tore, Assists, Paraden) folgen in Phase 2.
          </div>
          <div className="mt-6">
            <Button href="/team" variant="outline">
              Zurück zum Team
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
