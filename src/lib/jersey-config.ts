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
  frontNumber: { x1: 195, y1: 607, x2: 262, y2: 652 },
  backNumber: { x1: 703, y1: 652, x2: 900, y2: 782 },
  backName: { x1: 707, y1: 797, x2: 900, y2: 839 },
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
