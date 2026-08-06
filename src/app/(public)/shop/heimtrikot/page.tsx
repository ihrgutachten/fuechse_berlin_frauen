import { Bebas_Neue, Oswald } from "next/font/google";
import { JerseyConfigurator } from "@/components/shop/jersey-configurator";
import { PageHero } from "@/components/ui/page-hero";
import { getShopConfig, getShopProduct, isShopOpen } from "@/lib/shop";
import { notFound } from "next/navigation";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jersey-bebas",
  display: "swap",
});

const oswald = Oswald({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-jersey-oswald",
  display: "swap",
});

export const metadata = {
  title: "Heimtrikot konfigurieren",
  description:
    "Heimtrikot der Füchse Berlin Frauen mit Wunschname und Nummer konfigurieren und per E-Mail bestellen.",
};

export default function HeimtrikotConfiguratorPage() {
  if (!isShopOpen()) {
    notFound();
  }

  const shop = getShopConfig();
  const product = getShopProduct("heimtrikot");
  if (!product) notFound();

  return (
    <>
      <PageHero
        eyebrow="Shop · Wunschdruck"
        title="Heimtrikot"
        description="Nummer und Name live auf dem Blanko — dann Bestellwunsch senden."
      />
      <JerseyConfigurator
        shop={shop}
        product={product}
        fontClassName={`${bebas.variable} ${oswald.variable}`}
      />
    </>
  );
}
