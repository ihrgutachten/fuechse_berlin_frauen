import Image from "next/image";
import Link from "next/link";
import {
  squadCoordinator,
  squadGroups,
  squadPath,
  squads,
  type Squad,
  type SquadContact,
} from "@/data/mannschaften";
import { cn } from "@/lib/format";
import { SectionHeading } from "@/components/ui/section-heading";

const sectionScroll = "scroll-mt-[10.75rem] md:scroll-mt-[12rem]";

function ContactLine({ contact }: { contact: SquadContact }) {
  const name = contact.playerSlug ? (
    <Link
      href={`/team/${contact.playerSlug}`}
      className="font-semibold text-[var(--fb-ink)] underline-offset-2 hover:text-[var(--fb-accent)] hover:underline"
    >
      {contact.name}
    </Link>
  ) : (
    <span className="font-semibold text-[var(--fb-ink)]">{contact.name}</span>
  );

  return (
    <li>
      <p className="flex flex-wrap items-baseline gap-x-2">
        {name}
        {contact.playerSlug ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fb-accent)]">
            Bundesliga
          </span>
        ) : null}
      </p>
      {contact.email ? (
        <a
          href={`mailto:${contact.email}`}
          className="mt-0.5 block break-all text-sm text-[var(--fb-accent)] underline-offset-2 hover:underline"
        >
          {contact.email}
        </a>
      ) : null}
    </li>
  );
}

function SquadCard({ squad, wide = false }: { squad: Squad; wide?: boolean }) {
  const light = squad.tone === "light";

  return (
    <article
      id={squad.id}
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white",
        wide && "md:grid md:grid-cols-[minmax(16rem,22rem)_1fr]",
        sectionScroll,
      )}
    >
      <div
        className={cn(
          "relative flex items-end overflow-hidden px-4 py-4",
          squad.featured ? "min-h-40 md:min-h-48" : "min-h-32",
          wide && "md:items-start md:py-6",
          light ? "bg-[var(--fb-green-100)]" : "bg-[var(--fb-green-950)]",
        )}
      >
        <Image
          src="/logo-fuechse-berlin-frauen.png"
          alt=""
          width={140}
          height={158}
          className={cn(
            "pointer-events-none absolute -right-2 -top-6 w-auto select-none",
            squad.featured ? "h-40" : "h-32",
            light ? "opacity-30" : "opacity-20",
          )}
        />
        <div className="relative">
          {squad.league ? (
            <p
              className={cn(
                "mb-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                light ? "text-[var(--fb-accent)]" : "text-[var(--fb-green-300)]",
              )}
            >
              {squad.league}
            </p>
          ) : null}
          <p
            className={cn(
              "font-[family-name:var(--fb-font-display)] font-extrabold uppercase leading-none tracking-tight",
              squad.featured ? "text-6xl md:text-7xl" : "text-5xl",
              light ? "text-[var(--fb-green-950)]" : "text-white",
            )}
          >
            {squad.mark}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase leading-none tracking-tight">
            {squad.name}
          </h3>
          <p className="mt-2 text-sm text-[var(--fb-text-muted)]">{squad.line}</p>
        </div>
        <ul className="space-y-1.5 text-sm">
          {squad.contacts.map((contact) => (
            <ContactLine key={contact.name} contact={contact} />
          ))}
        </ul>
        {squad.email ? (
          <a
            href={`mailto:${squad.email}`}
            className="block break-all text-sm text-[var(--fb-accent)] underline-offset-2 hover:underline"
          >
            {squad.email}
          </a>
        ) : null}
        {squad.instagram ? (
          <a
            href={squad.instagram.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pt-1 text-sm font-semibold text-[var(--fb-ink)] underline-offset-2 hover:text-[var(--fb-accent)] hover:underline"
          >
            {squad.instagram.handle}
          </a>
        ) : (
          <span className="mt-auto" />
        )}
      </div>
    </article>
  );
}

export function MannschaftenBoard() {
  return (
    <>
      <div className="border-b border-[var(--fb-border)] bg-[var(--fb-soft)]">
        <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fb-accent)]">
            Weg durch den Verein
          </p>
          <nav aria-label="Weg durch den Verein">
            <ol className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {squadPath.map((stop, index) => (
                <li key={stop.label} className="flex shrink-0 items-center gap-1.5">
                  {index > 0 ? (
                    <span aria-hidden className="text-sm text-[var(--fb-faint)]">
                      ›
                    </span>
                  ) : null}
                  {stop.externalPage ? (
                    <Link
                      href={stop.href}
                      className="rounded-full bg-[var(--fb-green-700)] px-3 py-1 text-sm font-semibold text-white hover:bg-[var(--fb-green-800)]"
                    >
                      {stop.label}
                    </Link>
                  ) : (
                    <a
                      href={stop.href}
                      className="rounded-full border border-[var(--fb-border)] bg-white px-3 py-1 text-sm font-semibold text-[var(--fb-ink)] hover:border-[var(--fb-accent)] hover:text-[var(--fb-accent)]"
                    >
                      {stop.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      <nav
        aria-label="Mannschaften nach Alter"
        className="sticky top-[7.2rem] z-30 border-b border-[var(--fb-border)] bg-white/95 backdrop-blur md:top-[8.2rem]"
      >
        <ul className="mx-auto flex max-w-[var(--fb-container)] gap-2 overflow-x-auto px-[var(--fb-gutter)] py-3">
          {squadGroups.map((group) => (
            <li key={group.id} className="shrink-0">
              <a
                href={`#${group.id}`}
                className="inline-flex rounded-full bg-[var(--fb-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--fb-ink)] hover:bg-[var(--fb-green-100)] hover:text-[var(--fb-accent)]"
              >
                {group.chip}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-[var(--fb-container)] space-y-14 px-[var(--fb-gutter)] py-10 md:py-14">
        {squadGroups.map((group) => {
          const teams = squads.filter((squad) => squad.group === group.id);

          return (
            <section key={group.id} id={group.id} className={sectionScroll}>
              <SectionHeading title={group.title} description={group.description} />
              <div
                className={cn(
                  "grid items-start gap-4",
                  teams.length === 2 && "md:grid-cols-2",
                  teams.length > 2 && "sm:grid-cols-2 lg:grid-cols-3",
                )}
              >
                {teams.map((squad) => (
                  <SquadCard key={squad.id} squad={squad} wide={teams.length === 1} />
                ))}
              </div>
              {group.id === "erwachsene" ? (
                <p className="mt-4 text-sm text-[var(--fb-text-muted)]">
                  {squadCoordinator.line}:{" "}
                  <a
                    href={`mailto:${squadCoordinator.email}`}
                    className="font-semibold text-[var(--fb-accent)] underline-offset-2 hover:underline"
                  >
                    {squadCoordinator.name}
                  </a>
                </p>
              ) : null}
            </section>
          );
        })}

        <Link
          href="/team"
          className="flex flex-col justify-end overflow-hidden rounded-[var(--fb-radius-lg)] bg-[var(--fb-green-950)] px-5 py-6 text-white md:px-8 md:py-8"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fb-green-300)]">
            2. Bundesliga
          </p>
          <p className="mt-2 font-[family-name:var(--fb-font-display)] text-4xl font-extrabold uppercase leading-none tracking-tight md:text-5xl">
            Bundesliga-Team
          </p>
          <p className="mt-3 max-w-xl text-white/75">
            Spielerinnen, Trainerstab und Staff der Füchse Berlin Frauen.
          </p>
        </Link>
      </div>
    </>
  );
}
