import { ShopCatalog } from "@/components/shop/shop-catalog";
import { PageHero } from "@/components/ui/page-hero";
import { getShopConfig } from "@/lib/shop";

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
        <ShopCatalog shop={shop} />
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
