import type { Sponsor } from "@/lib/data";
import { cn } from "@/lib/format";

const tierLabel: Record<Sponsor["tier"], string> = {
  haupt: "Hauptpartner",
  partner: "Partner",
  foerderer: "Förderer",
};

type SponsorWallProps = {
  sponsors: Sponsor[];
  className?: string;
};

export function SponsorWall({ sponsors, className }: SponsorWallProps) {
  const tiers: Sponsor["tier"][] = ["haupt", "partner", "foerderer"];

  return (
    <div className={cn("space-y-8", className)}>
      {tiers.map((tier) => {
        const items = sponsors.filter((s) => s.tier === tier);
        if (!items.length) return null;
        return (
          <div key={tier}>
            <p className="mb-3 text-[var(--fb-fs-label)] font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-text-faint)]">
              {tierLabel[tier]}
            </p>
            <ul
              className={cn(
                "grid gap-3",
                tier === "haupt" && "grid-cols-1 sm:grid-cols-2",
                tier === "partner" && "grid-cols-2 md:grid-cols-3",
                tier === "foerderer" && "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
              )}
            >
              {items.map((sponsor) => (
                <li key={sponsor.id}>
                  <a
                    href={sponsor.url}
                    className={cn(
                      "flex items-center justify-center rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-[var(--fb-soft)] px-4 text-center font-semibold text-[var(--fb-text-muted)] transition hover:border-[var(--fb-accent)] hover:text-[var(--fb-accent)]",
                      tier === "haupt" ? "min-h-24 text-lg" : "min-h-16 text-sm",
                    )}
                  >
                    {sponsor.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
