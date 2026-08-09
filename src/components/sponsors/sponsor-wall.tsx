import Image from "next/image";
import Link from "next/link";
import type { Sponsor, SponsorTier } from "@/lib/data";
import { sponsorTierOrder } from "@/lib/data";
import { cn } from "@/lib/format";

type SponsorWallProps = {
  sponsors: Sponsor[];
  className?: string;
  /** Limit which tiers to show (e.g. homepage teaser). */
  tiers?: SponsorTier[];
};

function gridClass(tier: SponsorTier): string {
  switch (tier) {
    case "platin":
      return "grid-cols-1 max-w-5xl";
    case "gold":
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    case "silber":
    case "premium":
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
    case "partner":
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
    default:
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
  }
}

function cellClass(tier: SponsorTier): string {
  switch (tier) {
    case "platin":
      return "min-h-72 p-8 md:min-h-80 md:p-10";
    case "gold":
      return "min-h-40 p-6 md:min-h-48";
    default:
      return "min-h-20 p-4";
  }
}

function logoClass(tier: SponsorTier): string {
  switch (tier) {
    case "platin":
      // 400% of default max-h-16 / md:max-h-20
      return "h-auto max-h-64 w-auto max-w-full object-contain md:max-h-80";
    case "gold":
      // 200% of default
      return "h-auto max-h-32 w-auto max-w-full object-contain md:max-h-40";
    default:
      return "h-auto max-h-16 w-auto max-w-full object-contain md:max-h-20";
  }
}

function logoSize(tier: SponsorTier): { width: number; height: number } {
  switch (tier) {
    case "platin":
      return { width: 880, height: 480 };
    case "gold":
      return { width: 320, height: 180 };
    default:
      return { width: 160, height: 90 };
  }
}

export function SponsorWall({ sponsors, className, tiers }: SponsorWallProps) {
  const order = tiers ?? sponsorTierOrder;

  return (
    <div className={cn("space-y-10", className)}>
      {order.map((tier) => {
        const items = sponsors.filter((s) => s.tier === tier);
        if (!items.length) return null;
        const label = items[0]?.tierLabel ?? tier;
        return (
          <div key={tier}>
            <p className="mb-4 text-[var(--fb-fs-label)] font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-text-faint)]">
              {label}
            </p>
            <ul className={cn("grid gap-3", gridClass(tier))}>
              {items.map((sponsor) => {
                const profileHref = sponsor.profileSlug
                  ? `/sponsoren/${sponsor.profileSlug}`
                  : null;
                return (
                  <li key={sponsor.id} className="flex flex-col gap-2">
                    <a
                      href={profileHref ?? sponsor.url}
                      {...(profileHref
                        ? {}
                        : { target: "_blank", rel: "noopener noreferrer" })}
                      title={sponsor.name}
                      className={cn(
                        "flex flex-1 items-center justify-center rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white transition hover:border-[var(--fb-accent)]",
                        cellClass(tier),
                      )}
                    >
                      <Image
                        src={sponsor.logo}
                        alt={`Logo ${sponsor.name}`}
                        width={logoSize(tier).width}
                        height={logoSize(tier).height}
                        className={logoClass(tier)}
                      />
                    </a>
                    {profileHref ? (
                      <Link
                        href={profileHref}
                        className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fb-text-muted)] transition hover:text-[var(--fb-accent)]"
                      >
                        Weiter / Portrait
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
