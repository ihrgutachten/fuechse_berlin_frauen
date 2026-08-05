import Image from "next/image";
import { notFound } from "next/navigation";
import { PronounceNameButton } from "@/components/players/pronounce-name-button";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import {
  getPlayerBySlug,
  getTeamMembers,
  speechLangFromNationality,
} from "@/lib/data";

type Props = { params: Promise<{ spielerin: string }> };

export async function generateStaticParams() {
  return getTeamMembers().map((p) => ({ spielerin: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { spielerin } = await params;
  const player = getPlayerBySlug(spielerin);
  return { title: player?.name ?? "Team" };
}

export default async function PlayerPage({ params }: Props) {
  const { spielerin } = await params;
  const player = getPlayerBySlug(spielerin);
  if (!player) notFound();

  const isPlayer = player.role === "spielerin";
  const eyebrow = isPlayer
    ? `#${player.number} · ${player.positionLabel}`
    : player.positionLabel;

  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={player.name}
        titleAction={
          <PronounceNameButton
            name={player.name}
            audioSrc={player.nameAudio}
            lang={player.nameLang ?? speechLangFromNationality(player.nationality)}
            phonetic={player.namePhonetic}
          />
        }
      />
      <div className="mx-auto grid max-w-[var(--fb-container)] gap-8 px-[var(--fb-gutter)] py-10 md:grid-cols-[280px_1fr] md:py-14">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--fb-radius-lg)] bg-[var(--fb-green-900)]">
          <Image
            src={player.photo}
            alt={player.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 280px"
            className="object-cover object-top"
          />
        </div>
        <div>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[var(--fb-text-faint)]">Rolle</dt>
              <dd className="font-semibold">{player.positionLabel}</dd>
            </div>
            {player.nationality ? (
              <div>
                <dt className="text-[var(--fb-text-faint)]">Nation</dt>
                <dd className="font-semibold">{player.nationality}</dd>
              </div>
            ) : null}
            {player.height ? (
              <div>
                <dt className="text-[var(--fb-text-faint)]">Größe</dt>
                <dd className="font-semibold">{player.height}</dd>
              </div>
            ) : null}
            {player.birthPlace ? (
              <div>
                <dt className="text-[var(--fb-text-faint)]">Geburtsort</dt>
                <dd className="font-semibold">{player.birthPlace}</dd>
              </div>
            ) : null}
            {player.joined ? (
              <div>
                <dt className="text-[var(--fb-text-faint)]">Bei den Füchsen</dt>
                <dd className="font-semibold">seit {player.joined}</dd>
              </div>
            ) : null}
            {player.nickname ? (
              <div>
                <dt className="text-[var(--fb-text-faint)]">Spitzname</dt>
                <dd className="font-semibold">{player.nickname}</dd>
              </div>
            ) : null}
          </dl>

          {player.previousClubs ? (
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-text-faint)]">
                Bisherige Vereine
              </h2>
              <p className="mt-2 text-[var(--fb-text-muted)]">{player.previousClubs}</p>
            </div>
          ) : null}

          {player.patron ? (
            <div className="mt-6 rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-[var(--fb-soft)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-text-faint)]">
                Sponsoren-Patenschaft
              </p>
              {player.patronUrl ? (
                <a
                  href={player.patronUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block font-semibold text-[var(--fb-accent)] underline-offset-2 hover:underline"
                >
                  {player.patron}
                </a>
              ) : (
                <p className="mt-1 font-semibold text-[var(--fb-ink)]">{player.patron}</p>
              )}
            </div>
          ) : null}

          <div className="mt-8">
            <Button href="/team" variant="outline">
              Zurück zum Team
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
