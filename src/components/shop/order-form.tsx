"use client";

import { useEffect, useId, useState, useTransition, type FormEvent } from "react";
import type { ShopConfig, ShopProduct } from "@/lib/shop";
import { cn } from "@/lib/format";

type OrderFormProps = {
  shop: ShopConfig;
  initialProductId?: string;
};

type FormState = {
  productId: string;
  size: string;
  quantity: string;
  printName: string;
  printNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  note: string;
};

const fieldClass =
  "mt-1.5 w-full rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white px-3 py-2.5 text-sm text-[var(--fb-ink)] outline-none transition focus:border-[var(--fb-accent)] focus:ring-2 focus:ring-[var(--fb-green-100)]";

const labelClass =
  "text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]";

export function OrderForm({ shop, initialProductId }: OrderFormProps) {
  const formId = useId();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<"sent" | "mailto" | null>(null);
  const [form, setForm] = useState<FormState>({
    productId: initialProductId || shop.products[0]?.id || "",
    size: shop.sizes[2] || "M",
    quantity: "1",
    printName: "",
    printNumber: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    note: "",
  });

  useEffect(() => {
    if (!initialProductId) return;
    setForm((prev) => ({ ...prev, productId: initialProductId }));
  }, [initialProductId]);

  const selected: ShopProduct | undefined = shop.products.find((p) => p.id === form.productId);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
    setSuccess(null);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/shop/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: form.productId,
            size: form.size,
            quantity: Number(form.quantity),
            printName: form.printName,
            printNumber: form.printNumber,
            customerName: form.customerName,
            customerEmail: form.customerEmail,
            customerPhone: form.customerPhone,
            note: form.note,
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
        setForm((prev) => ({
          ...prev,
          printName: "",
          printNumber: "",
          note: "",
          quantity: "1",
        }));
      } catch {
        setError("Netzwerkfehler — bitte später erneut versuchen.");
      }
    });
  }

  return (
    <form
      id="bestellung"
      onSubmit={onSubmit}
      className="scroll-mt-24 rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-soft)] p-5 md:p-7"
    >
      <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--fb-ink)]">
        Bestellwunsch
      </h2>
      <p className="mt-2 text-sm text-[var(--fb-text-muted)]">
        Kein Online-Checkout — dein Wunsch geht per E-Mail an den Verein. Wir melden uns zur
        Bestätigung.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-product`} className={labelClass}>
            Produkt
          </label>
          <select
            id={`${formId}-product`}
            className={fieldClass}
            value={form.productId}
            onChange={(e) => update("productId", e.target.value)}
            required
          >
            {shop.products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — {product.price} €
              </option>
            ))}
          </select>
          {selected ? (
            <p className="mt-1.5 text-xs text-[var(--fb-text-faint)]">{selected.description}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${formId}-size`} className={labelClass}>
            Größe
          </label>
          <select
            id={`${formId}-size`}
            className={fieldClass}
            value={form.size}
            onChange={(e) => update("size", e.target.value)}
            required
          >
            {shop.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
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
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor={`${formId}-print-name`} className={labelClass}>
            Wunschname
          </label>
          <input
            id={`${formId}-print-name`}
            type="text"
            maxLength={40}
            placeholder="z. B. CONZE"
            className={fieldClass}
            value={form.printName}
            onChange={(e) => update("printName", e.target.value)}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-print-number`} className={labelClass}>
            Wunschnummer
          </label>
          <input
            id={`${formId}-print-number`}
            type="text"
            inputMode="numeric"
            maxLength={3}
            placeholder="z. B. 5"
            className={fieldClass}
            value={form.printNumber}
            onChange={(e) => update("printNumber", e.target.value)}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-name`} className={labelClass}>
            Dein Name
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            autoComplete="name"
            className={fieldClass}
            value={form.customerName}
            onChange={(e) => update("customerName", e.target.value)}
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
            value={form.customerEmail}
            onChange={(e) => update("customerEmail", e.target.value)}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-phone`} className={labelClass}>
            Telefon <span className="font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id={`${formId}-phone`}
            type="tel"
            autoComplete="tel"
            className={fieldClass}
            value={form.customerPhone}
            onChange={(e) => update("customerPhone", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-note`} className={labelClass}>
            Hinweis <span className="font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id={`${formId}-note`}
            rows={3}
            maxLength={500}
            className={cn(fieldClass, "resize-y")}
            value={form.note}
            onChange={(e) => update("note", e.target.value)}
            placeholder="Abholung, Lieferadresse, …"
          />
        </div>
      </div>

      {error ? (
        <p
          className="mt-4 rounded-[var(--fb-radius)] border border-[var(--fb-away-line)] bg-[var(--fb-away-soft)] px-3 py-2 text-sm text-[var(--fb-ink)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {success === "sent" ? (
        <p
          className="mt-4 rounded-[var(--fb-radius)] border border-[var(--fb-home-line)] bg-[var(--fb-home-soft)] px-3 py-2 text-sm text-[var(--fb-ink)]"
          role="status"
        >
          Bestellwunsch gesendet — wir melden uns bei dir.
        </p>
      ) : null}

      {success === "mailto" ? (
        <p
          className="mt-4 rounded-[var(--fb-radius)] border border-[var(--fb-home-line)] bg-[var(--fb-home-soft)] px-3 py-2 text-sm text-[var(--fb-ink)]"
          role="status"
        >
          Dein E-Mail-Programm sollte sich mit dem Bestellwunsch öffnen. Bitte absenden — falls
          nichts passiert, schreib an{" "}
          <a
            className="font-semibold text-[var(--fb-accent)] underline"
            href={`mailto:${shop.orderEmail}`}
          >
            {shop.orderEmail}
          </a>
          .
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex w-full items-center justify-center rounded-[var(--fb-radius)] bg-[var(--fb-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--fb-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Wird vorbereitet…" : "Bestellwunsch senden"}
      </button>
    </form>
  );
}
