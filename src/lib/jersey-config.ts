/** Pixel box on the blanko flyer (top-left → bottom-right). */
export type JerseyPrintBox = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

/** Overlay layout for a blanko flyer (pixel coords of the source image). */
export type JerseyPrintLayout = {
  productId: string;
  blankoImage: string;
  /** Example flyer for reference (optional) */
  exampleImage?: string;
  /** Blanko pixel size (Photoshop measurement space) */
  width: number;
  height: number;
  frontNumber: JerseyPrintBox;
  backNumber: JerseyPrintBox;
  backName: JerseyPrintBox;
};

/**
 * Heimtrikot blanko: Vorderseite links, Rückseite rechts.
 * Boxen aus Photoshop (oben links x,y — unten rechts x,y) auf 1080×1350.
 */
export const heimtrikotLayout: JerseyPrintLayout = {
  productId: "heimtrikot",
  blankoImage: "/shop/trikot-heim-blanko.jpg",
  exampleImage: "/shop/trikot-heim.jpg",
  width: 1080,
  height: 1350,
  /** Brustnummer: +30 % Größe, +5 px nach unten. */
  frontNumber: { x1: 168, y1: 594, x2: 289, y2: 675 },
  backNumber: { x1: 664, y1: 636, x2: 939, y2: 818 },
  /** Name: −10 px oben, +10 % Größe (vom Zentrum). */
  backName: { x1: 697, y1: 811, x2: 910, y2: 857 },
};

export const jerseyPrintFonts = [
  { id: "bebas", label: "Bebas Neue", cssVar: "var(--font-jersey-bebas)" },
  { id: "oswald", label: "Oswald Bold", cssVar: "var(--font-jersey-oswald)" },
] as const;

export type JerseyPrintFontId = (typeof jerseyPrintFonts)[number]["id"];

export function normalizePrintName(value: string): string {
  return value
    .replace(/ß/g, "SS")
    .replace(/ẞ/g, "SS")
    .toUpperCase()
    .replace(/[^A-ZÄÖÜ0-9 \-]/g, "")
    .slice(0, 12);
}

export function normalizePrintNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 2);
}

/** Convert a Photoshop pixel box to CSS % of the blanko. */
export function boxToPercent(
  box: JerseyPrintBox,
  width: number,
  height: number,
): { left: number; top: number; width: number; height: number } {
  return {
    left: (box.x1 / width) * 100,
    top: (box.y1 / height) * 100,
    width: ((box.x2 - box.x1) / width) * 100,
    height: ((box.y2 - box.y1) / height) * 100,
  };
}
