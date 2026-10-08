/**
 * Zentrale Modul-Registry der Seite.
 *
 * Ein "Modul" ist ein an-/abschaltbarer Funktionsbereich. Der Zustand (an/aus)
 * liegt in der Tabelle `module_flags` (siehe modules-db.ts); fehlt dort ein
 * Eintrag, gilt `defaultOn` aus dieser Registry. So muss bei neuen Modulen
 * nichts migriert werden.
 *
 * `surface` beschreibt, WO ein Modul sichtbar ist:
 *  - "nav"          Top-Level-Link in der Hauptnavigation (navLinks)
 *  - "tools-teaser" Kachel auf der /tools-Seite
 *  - "none"         (noch) nicht in der Navigation verlinkt
 */

export type ModuleKey =
  | "team"
  | "tabelle"
  | "matchday"
  | "tippspiel"
  | "aufstiegsrechner"
  | "kidsclub"
  | "einlaufkind"
  | "fanwerden";

export type ModuleSurface = "nav" | "tools-teaser" | "none";
export type ModuleStatus = "live" | "geplant";

export type ModuleDef = {
  key: ModuleKey;
  label: string;
  description: string;
  /** Zielroute des Moduls. Bei surface "nav" muss sie mit navLinks übereinstimmen. */
  href: string;
  /** "live" = Route existiert, "geplant" = Platzhalter im Dashboard. */
  status: ModuleStatus;
  /** false = Kernmodul, kann nicht abgeschaltet werden (z. B. Team, Tabelle). */
  toggleable: boolean;
  /** Zustand, solange kein Eintrag in module_flags existiert. */
  defaultOn: boolean;
  surface: ModuleSurface;
};

export const MODULES: ModuleDef[] = [
  {
    key: "team",
    label: "Team",
    description: "Kader, Spielerinnen und Betreuerstab.",
    href: "/team",
    status: "live",
    toggleable: false,
    defaultOn: true,
    surface: "nav",
  },
  {
    key: "tabelle",
    label: "Tabelle",
    description: "Aktueller Tabellenstand der Liga.",
    href: "/tabelle",
    status: "live",
    toggleable: false,
    defaultOn: true,
    surface: "nav",
  },
  {
    key: "matchday",
    label: "Matchday",
    description: "Live-Center am Spieltag: Countdown, Ergebnis, Stream.",
    href: "/matchday",
    status: "live",
    toggleable: true,
    defaultOn: true,
    surface: "nav",
  },
  {
    key: "tippspiel",
    label: "Tippspiel",
    description: "Spieltags-Tippspiel mit Rangliste und Preisen.",
    href: "/tools/tippspiel",
    status: "live",
    toggleable: true,
    defaultOn: true,
    surface: "tools-teaser",
  },
  {
    key: "aufstiegsrechner",
    label: "Aufstiegs-Rechner",
    description: "Szenarien durchspielen: Was braucht es für Platz X?",
    href: "/tools/szenario",
    status: "live",
    toggleable: true,
    defaultOn: true,
    surface: "tools-teaser",
  },
  {
    key: "kidsclub",
    label: "Kids Club",
    description: "Bereich für junge Fans. In Vorbereitung.",
    href: "/kids-club",
    status: "geplant",
    toggleable: false,
    defaultOn: false,
    surface: "none",
  },
  {
    key: "einlaufkind",
    label: "Einlaufkind",
    description: "Bewerbung als Einlaufkind. In Vorbereitung.",
    href: "/einlaufkind",
    status: "geplant",
    toggleable: false,
    defaultOn: false,
    surface: "none",
  },
  {
    key: "fanwerden",
    label: "Fan werden",
    description: "Mitglied oder Fan werden. In Vorbereitung.",
    href: "/fan-werden",
    status: "geplant",
    toggleable: false,
    defaultOn: false,
    surface: "none",
  },
];

export const MODULE_BY_KEY: Record<ModuleKey, ModuleDef> = Object.fromEntries(
  MODULES.map((m) => [m.key, m]),
) as Record<ModuleKey, ModuleDef>;

/** Default-Zustand (nur Registry, ohne DB). */
export function defaultModuleState(): Record<ModuleKey, boolean> {
  const state = {} as Record<ModuleKey, boolean>;
  for (const m of MODULES) state[m.key] = m.defaultOn;
  return state;
}
