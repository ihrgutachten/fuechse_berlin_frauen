"use client";

import { useCallback, useEffect, useState, type DragEvent } from "react";
import { cn } from "@/lib/format";

const TILE = 100;

type CaptchaSlot = { id: string; src: string };

type Challenge = {
  slots: CaptchaSlot[];
  pinSrc: string;
  challengeToken: string;
  expiresAt: number;
};

type LogoCaptchaProps = {
  proofToken: string | null;
  onProofChange: (proof: string | null) => void;
  disabled?: boolean;
};

export function LogoCaptcha({ proofToken, onProofChange, disabled }: LogoCaptchaProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [placedId, setPlacedId] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [pinSelected, setPinSelected] = useState(false);

  const loadChallenge = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPlacedId(null);
    setPinSelected(false);
    setDragOverId(null);
    onProofChange(null);

    try {
      const res = await fetch("/api/shop/captcha");
      const data = (await res.json()) as Challenge & { error?: string };
      if (!res.ok) {
        setError(data.error || "Captcha konnte nicht geladen werden.");
        setChallenge(null);
        return;
      }
      setChallenge({
        slots: data.slots,
        pinSrc: data.pinSrc,
        challengeToken: data.challengeToken,
        expiresAt: data.expiresAt,
      });
    } catch {
      setError("Netzwerkfehler beim Laden des Captchas.");
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }, [onProofChange]);

  useEffect(() => {
    void loadChallenge();
  }, [loadChallenge]);

  async function submitSlot(slotId: string) {
    if (!challenge || busy || disabled || proofToken) return;

    setBusy(true);
    setError(null);
    setPlacedId(slotId);

    try {
      const res = await fetch("/api/shop/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeToken: challenge.challengeToken,
          slotId,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; proofToken?: string; error?: string };

      if (!res.ok || !data.proofToken) {
        setShake(true);
        window.setTimeout(() => setShake(false), 450);
        setError(data.error || "Falscher Umriss.");
        setPlacedId(null);
        setPinSelected(false);
        await loadChallenge();
        return;
      }

      onProofChange(data.proofToken);
      setPinSelected(false);
    } catch {
      setError("Netzwerkfehler — bitte erneut versuchen.");
      setPlacedId(null);
    } finally {
      setBusy(false);
    }
  }

  function onDragStart(event: DragEvent) {
    if (proofToken || disabled || !challenge) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("text/plain", "fuechse-pin");
    event.dataTransfer.effectAllowed = "move";

    // Drag ghost at native asset size (100×100), no cell chrome.
    const source = (event.currentTarget as HTMLElement).querySelector("img");
    if (source instanceof HTMLImageElement && source.complete) {
      const ghost = source.cloneNode(true) as HTMLImageElement;
      ghost.width = TILE;
      ghost.height = TILE;
      ghost.style.position = "fixed";
      ghost.style.top = "-9999px";
      ghost.style.left = "-9999px";
      ghost.style.width = `${TILE}px`;
      ghost.style.height = `${TILE}px`;
      ghost.style.objectFit = "contain";
      ghost.style.background = "transparent";
      ghost.style.pointerEvents = "none";
      document.body.appendChild(ghost);
      event.dataTransfer.setDragImage(ghost, TILE / 2, TILE / 2);
      window.setTimeout(() => ghost.remove(), 0);
    }

    setPinSelected(true);
  }

  function onDropSlot(event: DragEvent, slotId: string) {
    event.preventDefault();
    setDragOverId(null);
    void submitSlot(slotId);
  }

  const solved = Boolean(proofToken);

  return (
    <div
      className={cn(
        "sm:col-span-2 rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-green-950)] p-4 text-white md:p-5",
        shake && "captcha-shake",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-white/60">
            Sicherheitscheck
          </p>
          <h3 className="mt-1 font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase tracking-tight">
            Finde den Fuchs
          </h3>
          <p className="mt-1 text-sm text-white/75">
            Ziehe das Füchse-Logo auf den passenden Umriss — oder per Klick: zuerst Logo, dann Umriss.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadChallenge()}
          disabled={loading || busy || disabled}
          className="rounded-[var(--fb-radius)] border border-white/25 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:bg-white/10 disabled:opacity-50"
        >
          Neu laden
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-white/60">Captcha wird geladen…</p>
      ) : null}

      {!loading && challenge ? (
        <div className="mt-5">
          <div
            className="mx-auto grid w-fit grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6"
            role="listbox"
            aria-label="Logo-Umrisse"
          >
            {challenge.slots.map((slot) => {
              const isOver = dragOverId === slot.id;
              const isPlaced = placedId === slot.id && solved;
              return (
                <button
                  key={slot.id}
                  type="button"
                  role="option"
                  aria-selected={isPlaced}
                  aria-label="Logo-Umriss"
                  disabled={solved || disabled || busy}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverId(slot.id);
                  }}
                  onDragLeave={() => setDragOverId((id) => (id === slot.id ? null : id))}
                  onDrop={(e) => onDropSlot(e, slot.id)}
                  onClick={() => {
                    if (!pinSelected || solved || disabled) return;
                    void submitSlot(slot.id);
                  }}
                  className={cn(
                    "relative size-[100px] shrink-0 overflow-hidden rounded-[var(--fb-radius)] bg-black/50 ring-1 ring-white/15 transition",
                    isOver && "bg-white/10 ring-[var(--fb-green-300)]",
                    isPlaced && "ring-2 ring-[var(--fb-green-500)]",
                    pinSelected && !solved && "hover:ring-white/50",
                    !solved && !disabled && "cursor-pointer",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slot.src}
                    alt=""
                    width={TILE}
                    height={TILE}
                    className="size-[100px] object-none"
                    draggable={false}
                  />
                  {isPlaced ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={challenge.pinSrc}
                      alt=""
                      width={TILE}
                      height={TILE}
                      className="pointer-events-none absolute inset-0 size-[100px] object-none"
                    />
                  ) : null}
                </button>
              );
            })}

            {/* Pin fills the last cell (bottom-right in a 2×6 grid) */}
            <button
              type="button"
              draggable={!solved && !disabled}
              onDragStart={onDragStart}
              onDragEnd={() => setPinSelected(false)}
              onClick={() => {
                if (solved || disabled) return;
                setPinSelected((v) => !v);
              }}
              aria-pressed={pinSelected}
              aria-label="Füchse-Logo — zum Platzieren ziehen oder anklicken"
              disabled={solved || disabled || busy}
              className={cn(
                "relative size-[100px] shrink-0 overflow-visible bg-transparent p-0 transition",
                pinSelected &&
                  !solved &&
                  "rounded-[var(--fb-radius)] ring-2 ring-[var(--fb-green-300)]",
                solved && "opacity-30",
                !solved && !disabled && "cursor-grab active:cursor-grabbing",
              )}
            >
              {!solved ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={challenge.pinSrc}
                  alt="Füchse Berlin Logo"
                  width={TILE}
                  height={TILE}
                  className="size-[100px] object-none"
                  draggable={false}
                />
              ) : null}
            </button>
          </div>


        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-[#ffb4a8]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}