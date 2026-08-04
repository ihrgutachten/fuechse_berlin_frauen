import type { ReactNode } from "react";
import { cn } from "@/lib/format";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-[var(--fb-fs-label)] font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-accent)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-[family-name:var(--fb-font-display)] text-[length:var(--fb-fs-h2)] font-extrabold uppercase leading-[var(--fb-lh-tight)] tracking-[var(--fb-ls-tight)] text-[var(--fb-ink)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-[var(--fb-text-muted)]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
