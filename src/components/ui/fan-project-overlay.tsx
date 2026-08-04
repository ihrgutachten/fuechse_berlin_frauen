"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "fb-fan-disclaimer-seen";

export function FanProjectOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--fb-green-950)]/85 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fan-disclaimer-title"
      onClick={dismiss}
    >
      <div
        className="animate-fade-up w-full max-w-md border border-white/15 bg-[var(--fb-green-900)] px-6 py-8 text-center text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)] md:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fb-green-300)]">
          Hinweis
        </p>
        <h2
          id="fan-disclaimer-title"
          className="mt-3 font-[family-name:var(--fb-font-display)] text-2xl font-extrabold uppercase leading-tight tracking-tight md:text-3xl"
        >
          Das ist ein Fan Projekt von Borris Häring
        </h2>
        <button
          type="button"
          onClick={dismiss}
          className="mt-7 w-full rounded-[var(--fb-radius)] bg-[var(--fb-green-500)] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[var(--fb-green-950)] transition hover:bg-[var(--fb-green-300)]"
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}
