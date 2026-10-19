import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayerEditor } from "@/components/admin/player-editor";
import { getPlayerById } from "@/lib/players-db";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const player = await getPlayerById(id);
  return { title: player?.name ?? "Spielerin" };
}

export default async function EditPlayerPage({ params }: Props) {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) notFound();

  return (
    <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-12">
      <Link href="/admin/team" className="text-sm font-semibold text-[var(--fb-accent)] hover:underline">
        ← Spielerinnen
      </Link>
      <h1 className="mt-6 font-[family-name:var(--fb-font-display)] text-3xl font-bold uppercase tracking-tight">
        {player.name}
      </h1>
      <div className="mt-8">
        <PlayerEditor initial={player} />
      </div>
    </div>
  );
}
