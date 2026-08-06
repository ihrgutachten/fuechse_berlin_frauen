"use client";

import Image from "next/image";
import { useState } from "react";
import { OrderForm } from "@/components/shop/order-form";
import type { ShopConfig } from "@/lib/shop";
import { formatShopPrice } from "@/lib/shop";

export function ShopCatalog({ shop }: { shop: ShopConfig }) {
  const [selectedId, setSelectedId] = useState(shop.products[0]?.id || "");

  function selectProduct(id: string) {
    setSelectedId(id);
    document.getElementById("bestellung")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto max-w-[var(--fb-container)] space-y-10 px-[var(--fb-gutter)] py-10 md:py-14">
      <p className="max-w-2xl text-[var(--fb-text-muted)]">{shop.intro}</p>
      <p className="text-sm font-medium text-[var(--fb-accent)]">{shop.windowNote}</p>

      <div className="grid gap-6 md:grid-cols-2">
        {shop.products.map((product, index) => (
          <article
            key={product.id}
            className="animate-fade-up overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative aspect-[4/3] bg-[var(--fb-green-950)]">
              <Image
                src={product.image}
                alt={`${product.name} — Füchse Berlin Frauen`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
                unoptimized
              />
            </div>
            <div className="p-5">
              <p className="text-[var(--fb-fs-label)] font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-accent)]">
                {product.subtitle}
              </p>
              <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-bold uppercase tracking-tight">
                  {product.name}
                </h2>
                <p className="font-[family-name:var(--fb-font-display)] text-2xl font-extrabold text-[var(--fb-ink)]">
                  {formatShopPrice(product.price)}
                </p>
              </div>
              <p className="mt-2 text-sm text-[var(--fb-text-muted)]">{product.description}</p>
              {product.includesPrint ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fb-muted)]">
                  Inkl. Wunschdruck
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => selectProduct(product.id)}
                className="mt-5 inline-flex items-center justify-center rounded-[var(--fb-radius)] bg-[var(--fb-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--fb-accent-hover)]"
              >
                Bestellen
              </button>
            </div>
          </article>
        ))}
      </div>

      <OrderForm shop={shop} initialProductId={selectedId} />
    </div>
  );
}
