import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import {
  getSponsorById,
  getSponsorProfileBySlug,
  getSponsorProfiles,
} from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getSponsorProfiles().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const profile = getSponsorProfileBySlug(slug);
  const sponsor = profile ? getSponsorById(profile.sponsorId) : undefined;
  return {
    title: sponsor ? `${sponsor.name} · Sponsor` : "Sponsor",
    description: profile?.intro,
  };
}

export default async function SponsorProfilePage({ params }: Props) {
  const { slug } = await params;
  const profile = getSponsorProfileBySlug(slug);
  if (!profile) notFound();

  const sponsor = getSponsorById(profile.sponsorId);
  if (!sponsor) notFound();

  const [hero, ...gallery] = profile.images;

  return (
    <>
      <PageHero
        eyebrow={sponsor.tierLabel}
        title={sponsor.name}
        description={profile.tagline}
      />

      <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="font-[family-name:var(--fb-font-display)] text-2xl font-bold uppercase leading-tight text-[var(--fb-ink)] md:text-3xl">
              {profile.headline}
            </p>
            <p className="mt-4 text-[var(--fb-text-muted)]">{profile.intro}</p>

            <div className="mt-8 space-y-8">
              {profile.sections.map((section) => (
                <section key={section.title}>
                  <h2 className="font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase tracking-tight">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-[var(--fb-text-muted)] leading-relaxed">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>

            {profile.services.length ? (
              <div className="mt-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-text-faint)]">
                  Qualität & Service
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {profile.services.map((service) => (
                    <li
                      key={service}
                      className="rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-[var(--fb-soft)] px-3 py-1.5 text-sm font-medium text-[var(--fb-ink)]"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="flex items-center justify-center rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white p-8">
              <Image
                src={sponsor.logo}
                alt={`Logo ${sponsor.name}`}
                width={240}
                height={140}
                className="h-auto max-h-24 w-auto object-contain"
                priority
              />
            </div>

            {hero ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--fb-radius-lg)] bg-[var(--fb-soft)]">
                <Image
                  src={hero.src}
                  alt={hero.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
              </div>
            ) : null}

            {gallery.length ? (
              <div className="grid grid-cols-2 gap-3">
                {gallery.map((image) => (
                  <div
                    key={image.src}
                    className="relative aspect-[4/3] overflow-hidden rounded-[var(--fb-radius)] bg-[var(--fb-soft)]"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 20vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-soft)] p-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-text-faint)]">
                Kontakt & Standorte
              </h2>
              <ul className="mt-4 space-y-4">
                {profile.locations.map((loc) => (
                  <li key={loc.name} className="text-sm">
                    <p className="font-semibold text-[var(--fb-ink)]">{loc.name}</p>
                    <p className="mt-1 text-[var(--fb-text-muted)]">{loc.address}</p>
                    {loc.phone ? (
                      <p className="mt-1">
                        <a
                          href={`tel:${loc.phone.replace(/\s|\//g, "")}`}
                          className="text-[var(--fb-accent)] hover:underline"
                        >
                          {loc.phone}
                        </a>
                      </p>
                    ) : null}
                    <p>
                      <a
                        href={`mailto:${loc.email}`}
                        className="text-[var(--fb-accent)] hover:underline"
                      >
                        {loc.email}
                      </a>
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href={profile.website} variant="solid">
                  Zur Website
                </Button>
                <Button href="/sponsoren" variant="outline">
                  Alle Sponsoren
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
