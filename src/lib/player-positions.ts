export const PLAYER_POSITIONS: { id: string; label: string; group: string }[] = [
  { id: "TW", label: "Tor", group: "tor" },
  { id: "LA", label: "Linksaußen", group: "aussen" },
  { id: "RL", label: "Rückraum links", group: "rueckraum" },
  { id: "RM", label: "Rückraum Mitte", group: "rueckraum" },
  { id: "RR", label: "Rückraum rechts", group: "rueckraum" },
  { id: "RM/RR", label: "Rückraum Mitte/Rechts", group: "rueckraum" },
  { id: "RA", label: "Rechtsaußen", group: "aussen" },
  { id: "KM", label: "Kreis", group: "kreis" },
];

export const POSITION_GROUPS: { key: string; label: string }[] = [
  { key: "tor", label: "Tor" },
  { key: "rueckraum", label: "Rückraum" },
  { key: "aussen", label: "Außen" },
  { key: "kreis", label: "Kreis" },
];

export function positionLabelFor(code: string): string {
  return PLAYER_POSITIONS.find((item) => item.id === code)?.label ?? code;
}

export function positionGroupFor(code: string): string {
  return PLAYER_POSITIONS.find((item) => item.id === code)?.group ?? "sonst";
}
