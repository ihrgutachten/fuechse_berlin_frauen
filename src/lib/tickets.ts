/** Official club ticket shop (leoticket white-label). */
export const TICKET_SHOP_URL = "https://fuechseberlinfrauen.de/tickets/";

export type TicketPriceRow = {
  label: string;
  price: string;
  note?: string;
};

export type TicketPriceGroup = {
  title: string;
  subtitle: string;
  rows: TicketPriceRow[];
};

export const ticketPriceGroups: TicketPriceGroup[] = [
  {
    title: "Tageskarten Außenblock",
    subtitle: "Blöcke 1, 4, 5 und 8. Freie Platzwahl.",
    rows: [
      { label: "Vollzahler", price: "15,00 €" },
      { label: "Ermäßigt", price: "12,00 €", note: "Rentner, Studierende, Schwerbeschädigte, Bundeswehr, 12-17 Jahre" },
      { label: "Kinder 7-11 Jahre", price: "7,00 €" },
      { label: "Kinder 0-6 Jahre", price: "frei", note: "In Begleitung eines Erwachsenen" },
    ],
  },
  {
    title: "Tageskarten Innenblock",
    subtitle: "Blöcke 2, 3 und 7. Freie Platzwahl.",
    rows: [
      { label: "Vollzahler", price: "16,00 €" },
      { label: "Ermäßigt", price: "13,00 €", note: "Rentner, Studierende, Schwerbeschädigte, Bundeswehr, 12-17 Jahre" },
      { label: "Kinder 7-11 Jahre", price: "8,00 €" },
      { label: "Kinder 0-6 Jahre", price: "frei", note: "In Begleitung eines Erwachsenen" },
    ],
  },
  {
    title: "Dauerkarten",
    subtitle: "Saisonkarte für die Heimspiele.",
    rows: [
      { label: "Erwachsene", price: "180,00 €" },
      { label: "Ermäßigt", price: "130,00 €" },
      { label: "Kinder", price: "95,00 €" },
    ],
  },
  {
    title: "Dauerkarten Füchse Fan-Club",
    subtitle: "Nur mit Fan-Club-Mitgliedschaft.",
    rows: [
      { label: "Erwachsene", price: "120,00 €" },
      { label: "Ermäßigt", price: "90,00 €" },
    ],
  },
];
