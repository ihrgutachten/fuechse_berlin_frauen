"use client";

import { useEffect, useRef, useState } from "react";
import type { Match } from "@/lib/data";
import { googleCalendarUrl } from "@/lib/ics";
import { cn } from "@/lib/format";
import { useOrigin } from "@/lib/use-origin";

/** Kleines Menü: Spieltermin in Apple- oder Google-Kalender übernehmen. */
export function AddToCalendar({ match }: { match: Match }) {
  const [open, setOpen] = useState(false);
  const origin = useOrigin();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const icsHref = `/spielplan.ics?match=${encodeURIComponent(match.id)}`;
  const googleHref = googleCalendarUrl(match, origin || undefined);

  const itemClass =
    "block w-full px-3 py-2 text-left text-sm font-medium text-[var(--fb-text)] hover:bg-[var(--fb-soft)]";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-[var(--fb-radius)] border border-[var(--fb-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--fb-accent)] transition hover:bg-[var(--fb-green-100)]",
        )}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 2v3M17 2v3M3.5 8.5h17M5 5h14a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V6.5A1.5 1.5 0 0 1 5 5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Kalender
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-1/2 z-20 mt-2 w-48 -translate-x-1/2 overflow-hidden rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white py-1 shadow-[0_14px_40px_rgba(4,20,12,0.18)]"
        >
          <a href={icsHref} download className={itemClass} role="menuitem" onClick={() => setOpen(false)}>
            Apple Kalender / Download
          </a>
          <a
            href={googleHref}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Google Kalender
          </a>
        </div>
      ) : null}
    </div>
  );
}
