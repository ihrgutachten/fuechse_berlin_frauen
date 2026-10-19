"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Cropper, { type Area } from "react-easy-crop";

const DEFAULT_ASPECT = 3 / 2;
const OUTPUT_LONG_EDGE = 1200;

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Breite / Höhe. Teamfotos sind 3/4, News-Titelbilder 3/2. */
  aspect?: number;
  label?: string;
  hint?: string;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = src;
  });
}

async function cropToBlob(src: string, area: Area, aspect: number): Promise<Blob> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  const outputWidth = aspect >= 1 ? OUTPUT_LONG_EDGE : Math.round(OUTPUT_LONG_EDGE * aspect);
  canvas.width = outputWidth;
  canvas.height = Math.round(outputWidth / aspect);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar.");
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Zuschnitt fehlgeschlagen."))),
      "image/jpeg",
      0.85,
    );
  });
}

export function CoverImageUpload({
  value,
  onChange,
  aspect = DEFAULT_ASPECT,
  label = "Titelbild wählen",
  hint = "Zuschnitt im Format 3:2",
}: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setArea(areaPixels);
  }, []);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    const dataUrl = await readFileAsDataUrl(file);
    setSrc(dataUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  async function confirmCrop() {
    if (!src || !area) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await cropToBlob(src, area, aspect);
      const form = new FormData();
      form.append("file", blob, "cover.jpg");
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Upload fehlgeschlagen.");
      }
      const data = (await res.json()) as { url: string };
      onChange(data.url);
      setSrc(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  function cancelCrop() {
    setSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      {value && !src ? (
        <div className="space-y-2">
          <div
            className="relative overflow-hidden rounded-[var(--fb-radius)] border border-[var(--fb-border)]"
            style={{ aspectRatio: aspect }}
          >
            <Image src={value} alt="Cover" fill className="object-cover" sizes="480px" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-[var(--fb-radius)] border border-[var(--fb-border)] px-3 py-1.5 text-sm font-semibold hover:border-[var(--fb-accent)]"
            >
              Anderes Bild
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-[var(--fb-radius)] border border-[var(--fb-border)] px-3 py-1.5 text-sm font-semibold text-[var(--fb-away)] hover:border-[var(--fb-away)]"
            >
              Entfernen
            </button>
          </div>
        </div>
      ) : null}

      {!value && !src ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-[var(--fb-radius)] border-2 border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] text-sm text-[var(--fb-text-muted)] hover:border-[var(--fb-accent)]"
          style={{ aspectRatio: aspect }}
        >
          <span className="font-semibold">{label}</span>
          <span className="mt-1 text-xs">{hint}</span>
        </button>
      ) : null}

      {src ? (
        <div className="space-y-3 rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white p-3">
          <div className="relative w-full overflow-hidden rounded bg-black" style={{ aspectRatio: aspect }}>
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <label className="block text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="mt-1 block w-full"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmCrop}
              disabled={busy}
              className="rounded-[var(--fb-radius)] bg-[var(--fb-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Lädt hoch …" : "Zuschnitt übernehmen"}
            </button>
            <button
              type="button"
              onClick={cancelCrop}
              disabled={busy}
              className="rounded-[var(--fb-radius)] border border-[var(--fb-border)] px-4 py-2 text-sm font-semibold"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-[var(--fb-away)]">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
