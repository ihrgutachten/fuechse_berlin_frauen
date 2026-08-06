"use client";

import Link from "next/link";
import {
  useId,
  useState,
  useTransition,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  heimtrikotLayout,
  jerseyPrintFonts,
  normalizePrintName,
  normalizePrintNumber,
  type JerseyPrintFontId,
} from "@/lib/jersey-config";
import { formatShopPrice, type ShopConfig, type ShopProduct } from "@/lib/shop";
import { cn } from "@/lib/format";

const fieldClass =
  "mt-1.5 w-full rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white px-3 py-2.5 text-sm text-[var(--fb-ink)] outline-none transition focus:border-[var(--fb-accent)] focus:ring-2 focus:ring-[var(--fb-green-100)]";

const labelClass =
  "text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]";

type Props = {
  shop: ShopConfig;
  product: ShopProduct;
  fontClassName: string;
};

export function JerseyConfigurator({ shop, product, fontClassName }: Props) {
  const formId = useId();
  const layout = heimtrikotLayout;
  const [pending, startTransition] = useTransition();
  const [printNumber, setPrintNumber] = useState("5");
  const [printName, setPrintName] = useState("CONZE");
  const [fontId, setFontId] = useState<JerseyPrintFontId>("bebas");
  const [size, setSize] = useState(shop.sizes[2] || "M");
  const [quantity, setQuantity] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<"sent" | "mailto" | null>(null);
  const [previewSrc, setPreviewSrc] = useState(layout.blankoImage);
  const usingFallback = previewSrc !== layout.blankoImage;

  const font = jerseyPrintFonts.find((f) => f.id === fontId) ?? jerseyPrintFonts[0];
  const displayNumber = printNumber || "·";
  const displayName = printName || "NAME";

  function overlayStyle(
    spot: { left: number; top: number; fontSizeVw: number },
    opts?: { letterSpacing?: string },
  ): CSSProperties {
    // fontSizeVw ≈ % of preview width (container query units)
    return {
      left: `${spot.left}%`,
      top: `${spot.top}%`,
      fontSize: `${spot.fontSizeVw}cqw`,
      fontFamily: font.cssVar,
      fontWeight: fontId === "oswald" ? 700 : 400,
      letterSpacing: opts?.letterSpacing ?? "0.02em",
      transform: "translate(-50%, -50%)",
    };
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!printNumber) {
      setError("Bitte eine Rücken-/Brustnummer angeben.");
      return;
    }
    if (!printName) {
      setError("Bitte einen Wunschname angeben.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/shop/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            size,
            quantity: Number(quantity),
            printName,
            printNumber,
            customerName,
            customerEmail,
            customerPhone,
            note: [note, `Schrift: ${font.label}`].filter(Boolean).join(" · "),
          }),
        });

        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          mode?: "sent" | "mailto";
          mailto?: string;
          warning?: string;
        };

        if (!res.ok) {
          setError(data.error || "Bestellung konnte nicht gesendet werden.");
          return;
        }

        if (data.mode === "mailto" && data.mailto) {
          window.location.href = data.mailto;
          setSuccess("mailto");
          if (data.warning) setError(data.warning);
          return;
        }

        setSuccess("sent");
      } catch {
        setError("Netzwerkfehler — bitte später erneut versuchen.");
      }
    });
  }

  return (
    <div className={cn("mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-10 md:py-14", fontClassName)}>
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <Link href="/shop" className="font-semibold text-[var(--fb-accent)] hover:underline">
          ← Shop
        </Link>
        <span className="text-[var(--fb-text-faint)]">/</span>
        <span className="text-[var(--fb-text-muted)]">Heimtrikot konfigurieren</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-green-950)]">
            <div className="relative w-full [container-type:inline-size]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt="Heimtrikot — Vorder- und Rückseite"
                width={1080}
                height={1350}
                className="block h-auto w-full"
                onError={() => {
                  if (layout.exampleImage && previewSrc !== layout.exampleImage) {
                    setPreviewSrc(layout.exampleImage);
                  }
                }}
              />

              {usingFallback ? (
                <p className="absolute inset-x-0 top-0 bg-black/70 px-3 py-2 text-center text-xs text-white">
                  Blanko fehlt — bitte <code>trikot-heim-blanko.jpg</code> nach{" "}
                  <code>public/shop/</code> hochladen (aktuell Beispielbild).
                </p>
              ) : null}

              {/* Front small number */}
              <span
                aria-hidden
                className="pointer-events-none absolute font-bold uppercase leading-none text-white"
                style={overlayStyle(layout.frontNumber)}
              >
                {displayNumber === "·" ? "" : displayNumber}
              </span>

              {/* Back large number */}
              <span
                aria-hidden
                className="pointer-events-none absolute font-bold uppercase leading-none text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]"
                style={overlayStyle(layout.backNumber)}
              >
                {displayNumber === "·" ? "" : displayNumber}
              </span>

              {/* Back name */}
              <span
                aria-hidden
                className="pointer-events-none absolute font-bold uppercase leading-none text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
                style={overlayStyle(layout.backName, { letterSpacing: "0.08em" })}
              >
                {displayName === "NAME" ? "" : displayName}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--fb-text-faint)]">
            Live-Vorschau · Schrift: {font.label} · Positionen am Blanko ausgerichtet
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="h-fit rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-soft)] p-5 md:p-6"
        >
          <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-bold uppercase tracking-tight">
            Wunschdruck
          </h2>
          <p className="mt-2 text-sm text-[var(--fb-text-muted)]">
            {product.name} · {formatShopPrice(product.price)} inkl. Wunschdruck
          </p>

          <div className="mt-6 grid gap-4">
            <div>
              <label htmlFor={`${formId}-number`} className={labelClass}>
                Nummer (Brust + Rücken)
              </label>
              <input
                id={`${formId}-number`}
                inputMode="numeric"
                maxLength={2}
                placeholder="z. B. 5"
                className={fieldClass}
                value={printNumber}
                onChange={(e) => setPrintNumber(normalizePrintNumber(e.target.value))}
                required
              />
            </div>

            <div>
              <label htmlFor={`${formId}-name`} className={labelClass}>
                Name (Rücken)
              </label>
              <input
                id={`${formId}-name`}
                type="text"
                maxLength={12}
                placeholder="z. B. CONZE"
                className={cn(fieldClass, "uppercase")}
                value={printName}
                onChange={(e) => setPrintName(normalizePrintName(e.target.value))}
                required
              />
            </div>

            <div>
              <label htmlFor={`${formId}-font`} className={labelClass}>
                Schrift
              </label>
              <select
                id={`${formId}-font`}
                className={fieldClass}
                value={fontId}
                onChange={(e) => setFontId(e.target.value as JerseyPrintFontId)}
              >
                {jerseyPrintFonts.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-[var(--fb-text-faint)]">
                Empfehlung: fette Condensed-Sans (Bebas Neue / Oswald). DIN Condensed lokal später möglich.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${formId}-size`} className={labelClass}>
                  Größe
                </label>
                <select
                  id={`${formId}-size`}
                  className={fieldClass}
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  required
                >
                  {shop.sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`${formId}-qty`} className={labelClass}>
                  Anzahl
                </label>
                <input
                  id={`${formId}-qty`}
                  type="number"
                  min={1}
                  max={10}
                  className={fieldClass}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor={`${formId}-customer`} className={labelClass}>
                Dein Name
              </label>
              <input
                id={`${formId}-customer`}
                type="text"
                autoComplete="name"
                className={fieldClass}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor={`${formId}-email`} className={labelClass}>
                E-Mail
              </label>
              <input
                id={`${formId}-email`}
                type="email"
                autoComplete="email"
                className={fieldClass}
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor={`${formId}-phone`} className={labelClass}>
                Telefon <span className="font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id={`${formId}-phone`}
                type="tel"
                autoComplete="tel"
                className={fieldClass}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor={`${formId}-note`} className={labelClass}>
                Hinweis <span className="font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                id={`${formId}-note`}
                rows={2}
                maxLength={500}
                className={cn(fieldClass, "resize-y")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {error ? (
            <p
              className="mt-4 rounded-[var(--fb-radius)] border border-[var(--fb-away-line)] bg-[var(--fb-away-soft)] px-3 py-2 text-sm"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {success === "sent" ? (
            <p
              className="mt-4 rounded-[var(--fb-radius)] border border-[var(--fb-home-line)] bg-[var(--fb-home-soft)] px-3 py-2 text-sm"
              role="status"
            >
              Bestellwunsch gesendet — wir melden uns bei dir.
            </p>
          ) : null}

          {success === "mailto" ? (
            <p
              className="mt-4 rounded-[var(--fb-radius)] border border-[var(--fb-home-line)] bg-[var(--fb-home-soft)] px-3 py-2 text-sm"
              role="status"
            >
              E-Mail-Programm sollte sich öffnen. Sonst an{" "}
              <a className="font-semibold text-[var(--fb-accent)] underline" href={`mailto:${shop.orderEmail}`}>
                {shop.orderEmail}
              </a>
              .
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || !shop.enabled}
            className="mt-6 inline-flex w-full items-center justify-center rounded-[var(--fb-radius)] bg-[var(--fb-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--fb-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Wird vorbereitet…" : "Bestellwunsch senden"}
          </button>
        </form>
      </div>
    </div>
  );
}
