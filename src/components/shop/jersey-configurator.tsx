"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  useTransition,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  boxToPercent,
  heimtrikotLayout,
  jerseyPrintFonts,
  normalizePrintName,
  normalizePrintNumber,
  type JerseyPrintBox,
  type JerseyPrintFontId,
} from "@/lib/jersey-config";
import { formatShopPrice, type ShopConfig, type ShopProduct } from "@/lib/shop";
import { cn } from "@/lib/format";
import { LogoCaptcha } from "@/components/shop/logo-captcha";

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
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [captchaProof, setCaptchaProof] = useState<string | null>(null);
  const usingFallback = previewSrc !== layout.blankoImage;

  const font = jerseyPrintFonts.find((f) => f.id === fontId) ?? jerseyPrintFonts[0];
  const displayNumber = printNumber || "·";
  const displayName = printName || "NAME";

  useEffect(() => {
    if (!captchaOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        setCaptchaOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [captchaOpen, pending]);

  function overlayStyle(
    box: JerseyPrintBox,
    opts?: { letterSpacing?: string; fontScale?: number },
  ): CSSProperties {
    const pct = boxToPercent(box, layout.width, layout.height);
    const fontScale = opts?.fontScale ?? 0.92;
    const fontSizeCqw = (pct.height * (layout.height / layout.width)) * fontScale;
    return {
      left: `${pct.left}%`,
      top: `${pct.top}%`,
      width: `${pct.width}%`,
      height: `${pct.height}%`,
      fontSize: `${fontSizeCqw}cqw`,
      fontFamily: font.cssVar,
      fontWeight: fontId === "oswald" ? 700 : 400,
      letterSpacing: opts?.letterSpacing ?? "0.02em",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      lineHeight: 1,
      overflow: "hidden",
      whiteSpace: "nowrap",
    };
  }

  function sendOrder(proof: string) {
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
            captchaProof: proof,
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
          if (data.error?.toLowerCase().includes("captcha")) {
            setCaptchaOpen(true);
            setCaptchaKey((k) => k + 1);
            setCaptchaProof(null);
          }
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

    setCaptchaProof(null);
    setCaptchaKey((k) => k + 1);
    setCaptchaOpen(true);
  }

  const onCaptchaProofChange = useCallback(
    (proof: string | null) => {
      setCaptchaProof(proof);
      if (!proof) return;
      setCaptchaOpen(false);
      sendOrder(proof);
    },
    // sendOrder closes over latest form values; re-create when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: fire once per solved proof
    [product.id, size, quantity, printName, printNumber, customerName, customerEmail, customerPhone, note, font.label],
  );

  function closeCaptcha() {
    if (pending) return;
    setCaptchaOpen(false);
    setCaptchaProof(null);
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

              <span
                aria-hidden
                className="pointer-events-none absolute font-bold uppercase leading-none text-white"
                style={overlayStyle(layout.frontNumber)}
              >
                {displayNumber === "·" ? "" : displayNumber}
              </span>

              <span
                aria-hidden
                className="pointer-events-none absolute font-bold uppercase leading-none text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]"
                style={overlayStyle(layout.backNumber)}
              >
                {displayNumber === "·" ? "" : displayNumber}
              </span>

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

      {captchaOpen ? (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-[var(--fb-green-950)]/85 p-4 backdrop-blur-sm md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="configurator-captcha-title"
          onClick={closeCaptcha}
        >
          <div
            className="animate-fade-up max-h-[min(92vh,900px)] w-full max-w-[680px] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="configurator-captcha-title" className="sr-only">
              Sicherheitscheck vor dem Absenden
            </p>
            <LogoCaptcha
              key={captchaKey}
              proofToken={captchaProof}
              onProofChange={onCaptchaProofChange}
              disabled={pending}
            />
            <button
              type="button"
              onClick={closeCaptcha}
              disabled={pending}
              className="mt-3 w-full rounded-[var(--fb-radius)] border border-white/25 bg-transparent px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-50"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}