import { OrderForm } from "@/components/shop/order-form";
import { PageHero } from "@/components/ui/page-hero";
import { formatShopPrice, getShopConfig } from "@/lib/shop";

export const metadata = {
  title: "Shop",
  description:
    "Trikots der Füchse Berlin Frauen bestellen — Bestellwunsch per E-Mail, inkl. Wunschdruck.",
};

export default function ShopPage() {
  const shop = getShopConfig();

  return (
    <>
      <PageHero
        eyebrow="Fanartikel"
        title="Shop"
        description={
          shop.enabled
            ? "Trikots bestellen — einfach per Bestellwunsch."
            : "Der Shop ist derzeit geschlossen."
        }
      />

      {shop.enabled ? (
        <div className="mx-auto max-w-[var(--fb-container)] space-y-10 px-[var(--fb-gutter)] py-10 md:py-14">
          <p className="max-w-2xl text-[var(--fb-text-muted)]">{shop.intro}</p>
          <p className="text-sm font-medium text-[var(--fb-accent)]">{shop.windowNote}</p>

          <div className="grid gap-6 md:grid-cols-2">
            {shop.products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white"
              >
                <div className="relative aspect-[4/3] bg-[var(--fb-green-950)]">
                  {/* Native img: reliable for static product art on Vercel */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={`${product.name} — Füchse Berlin Frauen`}
                    className="absolute inset-0 h-full w-full object-cover object-center"
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
                  <a
                    href="#bestellung"
                    className="mt-5 inline-flex items-center justify-center rounded-[var(--fb-radius)] bg-[var(--fb-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--fb-accent-hover)]"
                  >
                    Bestellen
                  </a>
                </div>
              </article>
            ))}
          </div>

          <OrderForm shop={shop} initialProductId={shop.products[0]?.id} />
        </div>
      ) : (
        <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-10 md:py-14">
          <div className="max-w-xl rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-[var(--fb-soft)] p-6 md:p-8">
            <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-bold uppercase tracking-tight">
              {shop.closedTitle}
            </h2>
            <p className="mt-3 text-[var(--fb-text-muted)]">{shop.closedMessage}</p>
            <p className="mt-4 text-sm text-[var(--fb-text-faint)]">{shop.windowNote}</p>
          </div>
        </div>
      )}
    </>
  );
}
