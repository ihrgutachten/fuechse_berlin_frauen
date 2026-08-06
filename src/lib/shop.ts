import shopConfig from "@/data/shop.json";

export type ShopProduct = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  includesPrint: boolean;
  description: string;
};

export type ShopConfig = {
  enabled: boolean;
  orderEmail: string;
  intro: string;
  windowNote: string;
  closedTitle: string;
  closedMessage: string;
  sizes: string[];
  products: ShopProduct[];
};

const config = shopConfig as ShopConfig;

/**
 * Shop open/closed.
 * Override without code change: SHOP_ENABLED=true|false (Vercel/Env).
 * Later: CMS/backend can flip `shop.json` enabled or replace this getter.
 */
export function isShopOpen(): boolean {
  const env = process.env.SHOP_ENABLED?.trim().toLowerCase();
  if (env === "true" || env === "1" || env === "on") return true;
  if (env === "false" || env === "0" || env === "off") return false;
  return config.enabled;
}

export function getShopConfig(): ShopConfig {
  return {
    ...config,
    enabled: isShopOpen(),
    orderEmail: process.env.SHOP_ORDER_EMAIL?.trim() || config.orderEmail,
  };
}

export function getShopProduct(id: string): ShopProduct | undefined {
  return config.products.find((p) => p.id === id);
}

export function formatShopPrice(price: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}
