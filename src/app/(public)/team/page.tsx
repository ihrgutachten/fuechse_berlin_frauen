import { PlayerCard } from "@/components/players/player-card";
import { PageHero } from "@/components/ui/page-hero";
import { getPlayers } from "@/lib/data";

export const metadata = { title: "Team" };

export default function TeamPage() {
  const players = getPlayers();

  return (
    <>
      <PageHero
        eyebrow="Mannschaft"
        title="Das Team"
        description="Spielerinnen-Kacheln mit Platzhalter-Profilen. Stats und Fotos folgen."
      />
      <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-10 md:py-14">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {players.map((player) => (
            <PlayerCard key={player.slug} player={player} />
          ))}
        </div>
      </div>
    </>
  );
}
