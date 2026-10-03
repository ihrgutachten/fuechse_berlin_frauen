"use client";

import { useState } from "react";
import { useOrigin } from "@/lib/use-origin";

const ICS_PATH = "/spielplan.ics";

/** Abo-Block: ganzen Spielplan in Apple- oder Google-Kalender abonnieren. */
export function CalendarSubscribe() {
  const origin = useOrigin();
  const [copied, setCopied] = useState(false);

  const httpsUrl = origin ? `${origin}${ICS_PATH}` : "";
  const webcalUrl = origin ? `${origin.replace(/^https?:/, "webcal:")}${ICS_PATH}` : "";

  async function copy() {
    if (!httpsUrl) return;
    try {
      await navigator.clipboard.writeText(httpsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const googleUrl = httpsUrl
    ? `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(httpsUrl)}`
    : "";

  const linkClass =
    "inline-flex items-center justify-center rounded-[var(--fb-radius)] px-4 py-2.5 text-sm font-semibold transition";

  return (
    <section className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-soft)] p-5 md:p-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-[family-name:var(--fb-font-display)] text-xl font-extrabold uppercase">
          Spielplan abonnieren
        </h2>
        <p className="text-sm text-[var(--fb-text-muted)]">
          Einmal abonnieren, dann landen alle Termine automatisch im Kalender. Neue Spiele und
          geänderte Anwurfzeiten synchronisieren sich von selbst.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={webcalUrl || ICS_PATH}
          className={`${linkClass} bg-[var(--fb-accent)] text-white hover:bg-[var(--fb-accent-hover)]`}
        >
          Apple Kalender
        </a>
        <a
          href={googleUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClass} border border-[var(--fb-accent)] text-[var(--fb-accent)] hover:bg-[var(--fb-green-100)]`}
        >
          Google Kalender
        </a>
        <button
          type="button"
          onClick={copy}
          className={`${linkClass} border border-[var(--fb-border)] text-[var(--fb-text-muted)] hover:bg-white`}
        >
          {copied ? "Kopiert" : "Link kopieren"}
        </button>
      </div>

      <div className="mt-4 space-y-2 text-xs text-[var(--fb-text-faint)]">
        <p className="break-all rounded-[var(--fb-radius)] bg-white px-3 py-2 font-mono">{httpsUrl}</p>
        <p>
          Android/Google: Google Kalender am Desktop öffnen, &quot;Weitere Kalender&quot; &gt;
          &quot;Per URL&quot;, diesen Link einfügen. Die Synchronisierung erscheint danach auch in der
          Handy-App. Hinweis: Abo-Kalender aktualisieren bei Google und Apple nur alle paar Stunden,
          nicht in Echtzeit.
        </p>
      </div>
    </section>
  );
}
