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
  frontNumber: { left: 31.8, top: 33.0, fontSizeVw: 4.4 },
  backNumber: { left: 68.8, top: 47.2, fontSizeVw: 11.5 },
  backName: { left: 68.8, top: 57.2, fontSizeVw: 4.3 },
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
