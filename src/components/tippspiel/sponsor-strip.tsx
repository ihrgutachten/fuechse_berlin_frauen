import Image from "next/image";
import { tipCardClass } from "@/components/tippspiel/card";
import { getSponsors } from "@/lib/data";

export function TippspielSponsorStrip() {
  const sponsors = getSponsors().filter(
    (sponsor) => sponsor.tier === "platin" || sponsor.tier === "gold",
  );
  if (!sponsors.length) return null;

  return (
    <section className={`${tipCardClass} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fb-text-faint)]">
        Partner des Spieltags
      </p>
      <ul className="mt-4 flex flex-wrap items-center justify-center gap-4 md:gap-8">
        {sponsors.map((sponsor) => (
          <li key={sponsor.id}>
            <a
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              title={sponsor.name}
              className="flex h-16 items-center justify-center"
            >
              <Image
                src={sponsor.logo}
                alt={`Logo ${sponsor.name}`}
                width={160}
                height={72}
                className="h-12 w-auto max-w-36 object-contain"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
