import { PageHero, PlaceholderNote } from "@/components/ui/page-hero";

export const metadata = { title: "Tippspiel" };

export default function TippspielPage() {
  return (
    <>
      <PageHero
        eyebrow="Coming soon"
        title="Spieltags-Tippspiel"
        description="Engagement + Datenerfassung + Sponsoring-Fläche."
      />
      <div className="mx-auto max-w-[var(--fb-container)] space-y-6 px-[var(--fb-gutter)] py-10 md:py-14">
        <PlaceholderNote>
          UI-Skeleton: Tippfelder und Leaderboard kommen in Phase 2.
        </PlaceholderNote>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="min-h-48 rounded-[var(--fb-radius-lg)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] p-5">
            <h2 className="font-semibold">Tipp abgeben</h2>
            <p className="mt-2 text-sm text-[var(--fb-text-muted)]">Platzhalter-Formular</p>
          </div>
          <div className="min-h-48 rounded-[var(--fb-radius-lg)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] p-5">
            <h2 className="font-semibold">Rangliste</h2>
            <p className="mt-2 text-sm text-[var(--fb-text-muted)]">Platzhalter-Leaderboard</p>
          </div>
        </div>
      </div>
    </>
  );
}
