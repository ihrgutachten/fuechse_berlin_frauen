import Link from "next/link";
import { PlayerEditor } from "@/components/admin/player-editor";

export const metadata = { title: "Neue Spielerin" };

export default function NewPlayerPage() {
  return (
    <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-12">
      <Link href="/admin/team" className="text-sm font-semibold text-[var(--fb-accent)] hover:underline">
        ← Spielerinnen
      </Link>
      <h1 className="mt-6 font-[family-name:var(--fb-font-display)] text-3xl font-bold uppercase tracking-tight">
        Neue Spielerin
      </h1>
      <div className="mt-8">
        <PlayerEditor />
      </div>
    </div>
  );
}
