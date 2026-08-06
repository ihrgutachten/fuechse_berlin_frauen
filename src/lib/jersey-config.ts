/** Overlay positions as % of the blanko flyer (width/height). Tunable. */
export type JerseyPrintLayout = {
  productId: string;
  blankoImage: string;
  /** Example flyer for reference (optional) */
  exampleImage?: string;
  frontNumber: { left: number; top: number; fontSizeVw: number };
  backNumber: { left: number; top: number; fontSizeVw: number };
  backName: { left: number; top: number; fontSizeVw: number };
};

/**
 * Heimtrikot blanko: Vorderseite links, Rückseite rechts.
 * Front: kleine Zahl obere rechte Brust (Träger-Sicht) → im Bild links am Brustbereich.
 * Back: große Zahl + Name darunter, unter Teamzeile / über RODE.
 */
export const heimtrikotLayout: JerseyPrintLayout = {
  productId: "heimtrikot",
  blankoImage: "/shop/trikot-heim-blanko.jpg",
  exampleImage: "/shop/trikot-heim.jpg",
  /** Unter BEW-Patch, Träger-rechte Brust (Bild links) — gemessen am Beispiel. */
  frontNumber: { left: 21.2, top: 47.1, fontSizeVw: 5.0 },
  /** Zentriert unter „FÜCHSE BERLIN“, gemessen am Beispiel-Flyer. */
  backNumber: { left: 74.0, top: 52.6, fontSizeVw: 11.2 },
  /** Unter Rückennummer, über RODE. */
  backName: { left: 74.0, top: 59.6, fontSizeVw: 4.0 },
};

export const jerseyPrintFonts = [
  { id: "bebas", label: "Bebas Neue", cssVar: "var(--font-jersey-bebas)" },
  { id: "oswald", label: "Oswald Bold", cssVar: "var(--font-jersey-oswald)" },
] as const;

export type JerseyPrintFontId = (typeof jerseyPrintFonts)[number]["id"];

export function normalizePrintName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 \-]/g, "")
    .slice(0, 12);
}

export function normalizePrintNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 2);
}
