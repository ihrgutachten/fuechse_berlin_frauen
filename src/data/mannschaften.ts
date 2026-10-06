export type SquadGroupId = "erwachsene" | "a" | "b" | "c" | "d" | "e" | "minis";

export type SquadContact = {
  name: string;
  email?: string;
  /** Slug im Bundesliga-Kader, wenn die Person dort spielt. */
  playerSlug?: string;
};

export type Squad = {
  id: string;
  group: SquadGroupId;
  name: string;
  mark: string;
  league?: string;
  line: string;
  instagram?: { handle: string; href: string };
  contacts: SquadContact[];
  /** Mannschafts-Mail, wenn sie keiner Person eindeutig gehört. */
  email?: string;
  tone: "dark" | "light";
  featured?: boolean;
};

export const squadGroups: {
  id: SquadGroupId;
  chip: string;
  title: string;
  description: string;
}[] = [
  {
    id: "erwachsene",
    chip: "Erwachsene",
    title: "Frauen",
    description: "2. und 3. Mannschaft, neben dem Bundesliga-Team.",
  },
  {
    id: "a",
    chip: "A",
    title: "A-Jugend",
    description: "",
  },
  {
    id: "b",
    chip: "B",
    title: "B-Jugend",
    description: "Zwei Mannschaften.",
  },
  {
    id: "c",
    chip: "C",
    title: "C-Jugend",
    description: "",
  },
  {
    id: "d",
    chip: "D",
    title: "D-Jugend",
    description: "Drei Mannschaften.",
  },
  {
    id: "e",
    chip: "E",
    title: "E-Jugend",
    description: "Drei Mannschaften.",
  },
  {
    id: "minis",
    chip: "Minis",
    title: "Minis",
    description: "Die jüngsten Füchse.",
  },
];

/** Vom Mini bis ins Bundesliga-Team. Letzte Station ist eine eigene Seite. */
export const squadPath: { href: string; label: string; externalPage?: boolean }[] = [
  { href: "#minis", label: "Minis" },
  { href: "#e", label: "E" },
  { href: "#d", label: "D" },
  { href: "#c", label: "C" },
  { href: "#b", label: "B" },
  { href: "#a", label: "A" },
  { href: "#f3", label: "3. Frauen" },
  { href: "#f2", label: "2. Frauen" },
  { href: "/team", label: "Bundesliga", externalPage: true },
];

export const squadCoordinator = {
  name: "Maik Strecker",
  email: "Maik78.Handball@gmx.de",
  line: "Koordination der 2. und 3. Frauen",
};

export const squads: Squad[] = [
  {
    id: "f2",
    group: "erwachsene",
    name: "2. Frauen",
    mark: "F2",
    league: "Oberliga",
    line: "Zweite Frauenmannschaft.",
    featured: true,
    tone: "dark",
    instagram: {
      handle: "@Fuechse_Berlin_F2",
      href: "https://www.instagram.com/fuechse_berlin_f2/",
    },
    contacts: [{ name: "Maik Strecker", email: "Strecker.ww@gmx.de" }],
  },
  {
    id: "f3",
    group: "erwachsene",
    name: "3. Frauen",
    mark: "F3",
    league: "Bezirksoberliga",
    line: "Dritte Frauenmannschaft.",
    featured: true,
    tone: "dark",
    instagram: {
      handle: "@Fuechse_Berlin_F3",
      href: "https://www.instagram.com/fuechse_berlin_f3/",
    },
    contacts: [{ name: "Martin Pohlke", email: "Martin.Pohlke@Mektec.de" }],
  },
  {
    id: "wa",
    group: "a",
    name: "wA",
    mark: "wA",
    league: "Regionalliga",
    line: "Weibliche A-Jugend.",
    tone: "dark",
    instagram: {
      handle: "@fuechseberlin.wa",
      href: "https://www.instagram.com/fuechseberlin.wa/",
    },
    contacts: [
      { name: "Wolf Nagel", email: "wolfnagel@gmx.de" },
      { name: "Michelle Stefes", playerSlug: "michelle-stefes" },
    ],
  },
  {
    id: "wb1",
    group: "b",
    name: "wB 1",
    mark: "wB1",
    league: "Regionalliga",
    line: "Weibliche B-Jugend, erste Mannschaft.",
    tone: "dark",
    email: "fuechse-berlin@c-marquardt.de",
    contacts: [
      { name: "Marco Schiller" },
      { name: "Laura Penzes", playerSlug: "laura-penzes" },
    ],
  },
  {
    id: "wb2",
    group: "b",
    name: "wB 2",
    mark: "wB2",
    league: "Verbandsliga",
    line: "Weibliche B-Jugend, zweite Mannschaft.",
    tone: "dark",
    contacts: [
      { name: "Niklas Behrends", email: "niklasbehrends@gmail.com" },
      { name: "Anouk Nieuwenweg", playerSlug: "anouk-nieuwenweg" },
    ],
  },
  {
    id: "wc1",
    group: "c",
    name: "wC 1",
    mark: "wC",
    line: "Weibliche C-Jugend.",
    tone: "dark",
    contacts: [
      { name: "Wolf Nagel", email: "wolfnagel@gmx.de" },
      { name: "Britt van der Baan", playerSlug: "britt-van-der-baan" },
    ],
  },
  {
    id: "wd1",
    group: "d",
    name: "wD 1",
    mark: "wD1",
    line: "Weibliche D-Jugend, erste Mannschaft.",
    tone: "dark",
    contacts: [
      { name: "Oke Seißer", email: "okeseisser@web.de" },
      { name: "Nomi in de Braekt", playerSlug: "nomi-in-de-braekt" },
    ],
  },
  {
    id: "wd2",
    group: "d",
    name: "wD 2",
    mark: "wD2",
    line: "Weibliche D-Jugend, zweite Mannschaft.",
    tone: "dark",
    contacts: [
      { name: "Meike Müller", email: "meikej@gmx.de" },
      { name: "Jonna Schaube", playerSlug: "jonna-schaube" },
    ],
  },
  {
    id: "wd3",
    group: "d",
    name: "wD 3",
    mark: "wD3",
    line: "Weibliche D-Jugend, dritte Mannschaft.",
    tone: "dark",
    contacts: [{ name: "Markus Henneberg", email: "Markus_henneberg@web.de" }],
  },
  {
    id: "we1",
    group: "e",
    name: "wE 1",
    mark: "wE1",
    line: "Weibliche E-Jugend, erste Mannschaft.",
    tone: "dark",
    contacts: [
      { name: "Annika Fleck", email: "annikafleck@googlemail.com" },
      { name: "Melina Haubitz", email: "melinahaubitz@gmail.com" },
      { name: "Angela Cappellaro", playerSlug: "angela-cappellaro" },
    ],
  },
  {
    id: "we2",
    group: "e",
    name: "wE 2",
    mark: "wE2",
    line: "Weibliche E-Jugend, zweite Mannschaft.",
    tone: "dark",
    contacts: [
      { name: "Tricia Isokpunwu", email: "triciaisokpunwu@gmail.com" },
      { name: "Leoni Baßiner", playerSlug: "leoni-bassiner" },
    ],
  },
  {
    id: "we3",
    group: "e",
    name: "wE 3",
    mark: "wE3",
    line: "Weibliche E-Jugend, dritte Mannschaft.",
    tone: "dark",
    contacts: [
      { name: "Marie Marquardt", email: "ma-marie@gmx.net" },
      { name: "Alissa Werle", playerSlug: "alissa-werle" },
    ],
  },
  {
    id: "minis",
    group: "minis",
    name: "Minis",
    mark: "Minis",
    line: "Minis 1-3. Einstieg in den Handball.",
    tone: "light",
    contacts: [{ name: "Oliver Heise", email: "heise-oliver@gmx.de" }],
  },
];
