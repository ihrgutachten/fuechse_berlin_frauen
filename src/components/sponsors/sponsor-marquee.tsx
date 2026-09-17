import type { Sponsor, SponsorTier } from "@/lib/data";
import { homepageSponsorTiers } from "@/lib/data";

type MarqueeSize = "lg" | "sm";

type SponsorMarqueeProps = {
  sponsors: Sponsor[];
  tiers?: SponsorTier[];
};

function tickerLogo(sponsor: Sponsor): string {
  return `/sponsors/ticker/${sponsor.id}.png`;
}

function LogoSet({
  sponsors,
  clone = false,
  size,
}: {
  sponsors: Sponsor[];
  clone?: boolean;
  size: MarqueeSize;
}) {
  const rowClass =
    size === "lg"
      ? "flex shrink-0 items-center gap-20 px-10"
      : "flex shrink-0 items-center gap-10 px-5";
  const itemClass =
    size === "lg"
      ? "flex h-14 shrink-0 items-center justify-center"
      : "flex h-7 shrink-0 items-center justify-center";
  const imageClass =
    size === "lg" ? "h-14 w-auto object-contain" : "h-7 w-auto object-contain";

  return (
    <ul className={clone ? `sponsor-marquee-clone ${rowClass}` : rowClass}>
      {sponsors.map((sponsor) => (
        <li key={`${clone ? "clone" : "set"}-${sponsor.id}`} className={itemClass}>
          <img
            src={tickerLogo(sponsor)}
            alt=""
            loading={clone ? "lazy" : "eager"}
            decoding="async"
            className={imageClass}
          />
        </li>
      ))}
    </ul>
  );
}

function MarqueeTrack({
  sponsors,
  size,
  variant = "main",
}: {
  sponsors: Sponsor[];
  size: MarqueeSize;
  variant?: "main" | "fast";
}) {
  if (!sponsors.length) return null;

  return (
    <div className="overflow-hidden" aria-hidden>
      <div
        className={
          variant === "fast" ? "sponsor-marquee-track-fast" : "sponsor-marquee-track"
        }
      >
        <LogoSet sponsors={sponsors} size={size} />
        <LogoSet sponsors={sponsors} size={size} clone />
      </div>
    </div>
  );
}

export function SponsorMarquee({
  sponsors,
  tiers = [...homepageSponsorTiers, "ausruestung"],
}: SponsorMarqueeProps) {
  const primary = sponsors.filter((sponsor) => tiers.includes(sponsor.tier));
  const secondary = sponsors.filter((sponsor) => !tiers.includes(sponsor.tier));
  if (!primary.length && !secondary.length) return null;

  return (
    <section className="border-b border-[var(--fb-border)] bg-white" aria-label="Partner">
      {primary.length ? (
        <div className="pt-[15px] pb-2 mb-[15px]">
          <MarqueeTrack sponsors={primary} size="lg" />
        </div>
      ) : null}
      {secondary.length ? (
        <div className="pt-1 pb-[10px]">
          <MarqueeTrack sponsors={secondary} size="sm" variant="fast" />
        </div>
      ) : null}
    </section>
  );
}
