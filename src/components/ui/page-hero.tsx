import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ToolTeaserProps = {
  href: string;
  title: string;
  description: string;
  comingSoon?: boolean;
};

export function ToolTeaser({
  href,
  title,
  description,
  comingSoon = true,
}: ToolTeaserProps) {
  return (
    <article className="flex flex-col rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase tracking-tight">
          {title}
        </h3>
        {comingSoon ? (
          <span className="rounded-full bg-[var(--fb-green-100)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--fb-accent)]">
            Coming soon
          </span>
        ) : null}
      </div>
      <p className="mb-5 flex-1 text-sm text-[var(--fb-text-muted)]">{description}</p>
      <Button href={href} variant="outline">
        Öffnen
      </Button>
    </article>
  );
}

export function PageHero({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
}) {
  return (
    <div className="border-b border-[var(--fb-border)] bg-[var(--fb-green-950)] px-[var(--fb-gutter)] py-10 text-white md:py-14">
      <div className="mx-auto max-w-[var(--fb-container)]">
        {eyebrow ? (
          <p className="mb-2 text-[var(--fb-fs-label)] font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-green-300)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-[family-name:var(--fb-font-display)] text-4xl font-extrabold uppercase leading-none tracking-tight md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-white/75">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

export function PlaceholderNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[var(--fb-radius)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] px-4 py-3 text-sm text-[var(--fb-text-muted)]">
      {children}{" "}
      <Link href="/" className="font-semibold text-[var(--fb-accent)] hover:underline">
        Zur Startseite
      </Link>
    </p>
  );
}
